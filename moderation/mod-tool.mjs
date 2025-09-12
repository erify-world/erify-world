import { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { config } from 'dotenv';

// Load environment variables
config();

// ERIFY™ role hierarchy
const ERIFY_ROLES = {
  SUPREME: '👑 Supreme 4',
  COUNCIL: '🛡 Council Guardians', 
  CITIZENS: '🌍 Citizens',
  FLAME: '🔥 Flame Initiates'
};

// Anti-spam tracking
const messageTracker = new Map();
const SPAM_THRESHOLD = 5; // messages
const SPAM_WINDOW = 10000; // 10 seconds

class ModerationTool {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildModeration,
      ],
    });

    this.mutedUsers = new Map(); // Store muted users with expiry times
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.client.once('ready', () => {
      console.log(`🛡️ ERIFY™ Moderation Bot is ready! Logged in as ${this.client.user.tag}`);
      this.startMuteChecker();
    });

    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;
      await this.handleCommand(interaction);
    });

    this.client.on('messageCreate', async (message) => {
      if (message.author.bot) return;
      await this.checkForSpam(message);
    });
  }

  async handleCommand(interaction) {
    const { commandName, options, member, guild } = interaction;

    // Check permissions
    if (!this.hasModeratorPermissions(member)) {
      return await interaction.reply({
        content: '❌ You need to be a Council Guardian or Supreme to use moderation commands.',
        ephemeral: true,
      });
    }

    try {
      switch (commandName) {
        case 'mute':
          await this.handleMute(interaction);
          break;
        case 'unmute':
          await this.handleUnmute(interaction);
          break;
        case 'kick':
          await this.handleKick(interaction);
          break;
        case 'ban':
          await this.handleBan(interaction);
          break;
      }
    } catch (error) {
      console.error('Command error:', error);
      await interaction.reply({
        content: '❌ An error occurred while executing the command.',
        ephemeral: true,
      });
    }
  }

  hasModeratorPermissions(member) {
    return member.roles.cache.some(role => 
      role.name === ERIFY_ROLES.SUPREME || 
      role.name === ERIFY_ROLES.COUNCIL ||
      member.permissions.has(PermissionFlagsBits.ModerateMembers)
    );
  }

  async handleMute(interaction) {
    const user = interaction.options.getUser('user');
    const duration = interaction.options.getString('duration') || '1h';
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const member = await interaction.guild.members.fetch(user.id);
    
    if (!member) {
      return await interaction.reply({ content: '❌ User not found in server.', ephemeral: true });
    }

    // Parse duration
    const muteTime = this.parseDuration(duration);
    if (!muteTime) {
      return await interaction.reply({ content: '❌ Invalid duration format. Use: 1h, 30m, 1d, etc.', ephemeral: true });
    }

    try {
      const expiresAt = new Date(Date.now() + muteTime);
      await member.timeout(muteTime, reason);
      
      this.mutedUsers.set(user.id, expiresAt);

      const embed = new EmbedBuilder()
        .setColor(0xFF6B35)
        .setTitle('🔇 User Muted')
        .addFields(
          { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
          { name: 'Duration', value: duration, inline: true },
          { name: 'Expires', value: `<t:${Math.floor(expiresAt.getTime() / 1000)}:R>`, inline: true },
          { name: 'Reason', value: reason, inline: false },
          { name: 'Moderator', value: interaction.user.tag, inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
      await this.logAction('MUTE', interaction.user, user, reason, { duration, expires: expiresAt });

    } catch (error) {
      console.error('Mute error:', error);
      await interaction.reply({ content: '❌ Failed to mute user.', ephemeral: true });
    }
  }

  async handleUnmute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const member = await interaction.guild.members.fetch(user.id);
    
    if (!member) {
      return await interaction.reply({ content: '❌ User not found in server.', ephemeral: true });
    }

    try {
      await member.timeout(null, reason);
      this.mutedUsers.delete(user.id);

      const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('🔊 User Unmuted')
        .addFields(
          { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
          { name: 'Reason', value: reason, inline: false },
          { name: 'Moderator', value: interaction.user.tag, inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
      await this.logAction('UNMUTE', interaction.user, user, reason);

    } catch (error) {
      console.error('Unmute error:', error);
      await interaction.reply({ content: '❌ Failed to unmute user.', ephemeral: true });
    }
  }

  async handleKick(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const member = await interaction.guild.members.fetch(user.id);
    
    if (!member) {
      return await interaction.reply({ content: '❌ User not found in server.', ephemeral: true });
    }

    try {
      await member.kick(reason);

      const embed = new EmbedBuilder()
        .setColor(0xFF9500)
        .setTitle('👢 User Kicked')
        .addFields(
          { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
          { name: 'Reason', value: reason, inline: false },
          { name: 'Moderator', value: interaction.user.tag, inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
      await this.logAction('KICK', interaction.user, user, reason);

    } catch (error) {
      console.error('Kick error:', error);
      await interaction.reply({ content: '❌ Failed to kick user.', ephemeral: true });
    }
  }

  async handleBan(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const deleteMessages = interaction.options.getInteger('delete_messages') || 0;

    try {
      await interaction.guild.members.ban(user.id, {
        deleteMessageDays: deleteMessages,
        reason: reason
      });

      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('🔨 User Banned')
        .addFields(
          { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
          { name: 'Reason', value: reason, inline: false },
          { name: 'Messages Deleted', value: `${deleteMessages} days`, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
      await this.logAction('BAN', interaction.user, user, reason, { deleteMessages });

    } catch (error) {
      console.error('Ban error:', error);
      await interaction.reply({ content: '❌ Failed to ban user.', ephemeral: true });
    }
  }

  async checkForSpam(message) {
    const userId = message.author.id;
    const now = Date.now();
    
    if (!messageTracker.has(userId)) {
      messageTracker.set(userId, []);
    }
    
    const userMessages = messageTracker.get(userId);
    userMessages.push(now);
    
    // Remove messages older than the spam window
    const recentMessages = userMessages.filter(timestamp => now - timestamp < SPAM_WINDOW);
    messageTracker.set(userId, recentMessages);
    
    if (recentMessages.length >= SPAM_THRESHOLD) {
      try {
        const member = message.member;
        if (member && !this.hasModeratorPermissions(member)) {
          await member.timeout(300000, 'Anti-spam: Too many messages'); // 5 minute timeout
          
          const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('🚫 Anti-Spam Action')
            .addFields(
              { name: 'User', value: `${message.author.tag} (${message.author.id})`, inline: true },
              { name: 'Action', value: '5-minute timeout', inline: true },
              { name: 'Reason', value: 'Spam detection', inline: true }
            )
            .setTimestamp();

          await this.logAction('AUTO_MUTE', this.client.user, message.author, 'Spam detection', { duration: '5m' });
        }
      } catch (error) {
        console.error('Anti-spam error:', error);
      }
    }
  }

  parseDuration(duration) {
    const regex = /^(\d+)([smhd])$/;
    const match = duration.match(regex);
    
    if (!match) return null;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    const multipliers = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000
    };
    
    return value * multipliers[unit];
  }

  startMuteChecker() {
    setInterval(() => {
      const now = new Date();
      for (const [userId, expiresAt] of this.mutedUsers.entries()) {
        if (now >= expiresAt) {
          this.mutedUsers.delete(userId);
          // Note: Discord.js v14 automatically removes timeouts when they expire
        }
      }
    }, 60000); // Check every minute
  }

  async logAction(action, moderator, target, reason, extra = {}) {
    const logChannelId = process.env.MOD_LOG_CHANNEL_ID;
    if (!logChannelId) return;

    try {
      const logChannel = await this.client.channels.fetch(logChannelId);
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setColor(this.getActionColor(action))
        .setTitle(`📋 Moderation Log: ${action}`)
        .addFields(
          { name: 'Target', value: `${target.tag} (${target.id})`, inline: true },
          { name: 'Moderator', value: `${moderator.tag} (${moderator.id})`, inline: true },
          { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp();

      if (extra.duration) {
        embed.addFields({ name: 'Duration', value: extra.duration, inline: true });
      }
      if (extra.expires) {
        embed.addFields({ name: 'Expires', value: `<t:${Math.floor(extra.expires.getTime() / 1000)}:R>`, inline: true });
      }
      if (extra.deleteMessages !== undefined) {
        embed.addFields({ name: 'Messages Deleted', value: `${extra.deleteMessages} days`, inline: true });
      }

      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Log error:', error);
    }
  }

  getActionColor(action) {
    const colors = {
      MUTE: 0xFF6B35,
      UNMUTE: 0x00FF00,
      KICK: 0xFF9500,
      BAN: 0xFF0000,
      AUTO_MUTE: 0xFFFF00
    };
    return colors[action] || 0x000000;
  }

  start() {
    this.client.login(process.env.MOD_BOT_TOKEN);
  }
}

// Start the moderation bot
const moderationBot = new ModerationTool();
moderationBot.start();