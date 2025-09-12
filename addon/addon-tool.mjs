import { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } from 'discord.js';
import { config } from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
config();

// ERIFY™ role configuration
const ERIFY_ROLES = {
  SUPREME: { name: '👑 Supreme 4', color: '#FFD700', description: 'Ultimate access to all ERIFY™ features' },
  COUNCIL: { name: '🛡 Council Guardians', color: '#4169E1', description: 'Moderation and community leadership' },
  CITIZENS: { name: '🌍 Citizens', color: '#32CD32', description: 'Core community members' },
  FLAME: { name: '🔥 Flame Initiates', color: '#FF4500', description: 'New members beginning their journey' }
};

class AddonTool {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.dataFile = join(process.cwd(), 'addon', 'addon-data.json');
    this.data = this.loadData();
    this.setupEventListeners();
  }

  loadData() {
    try {
      return JSON.parse(readFileSync(this.dataFile, 'utf8'));
    } catch (error) {
      console.log('Creating new addon data file...');
      const defaultData = {
        helpDeskChannels: [],
        reportChannels: [],
        roleSelectors: [],
        welcomeConfig: {
          enabled: true,
          message: "Welcome to ERIFY™ World! 🌍✨\\n\\nYou've joined a community dedicated to luxury digital experiences and innovation."
        }
      };
      this.saveData(defaultData);
      return defaultData;
    }
  }

  saveData(data = this.data) {
    writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
  }

  setupEventListeners() {
    this.client.once('ready', () => {
      console.log(`🎉 ERIFY™ Add-on Bot is ready! Logged in as ${this.client.user.tag}`);
    });

    this.client.on('interactionCreate', async (interaction) => {
      if (interaction.isChatInputCommand()) {
        await this.handleCommand(interaction);
      } else if (interaction.isButton()) {
        await this.handleButton(interaction);
      }
    });

    this.client.on('messageCreate', async (message) => {
      if (message.author.bot) return;
      await this.handleAutoThread(message);
    });

    this.client.on('guildMemberAdd', async (member) => {
      await this.handleWelcome(member);
    });
  }

  async handleCommand(interaction) {
    const { commandName, options, member } = interaction;

    // Check permissions for configuration commands
    if (['helpdeskset', 'rolesetup', 'welcomeconfig', 'reportset'].includes(commandName)) {
      if (!this.hasConfigPermissions(member)) {
        return await interaction.reply({
          content: '❌ You need to be a Council Guardian or Supreme to configure add-ons.',
          ephemeral: true,
        });
      }
    }

    try {
      switch (commandName) {
        case 'helpdeskset':
          await this.handleHelpDeskSet(interaction);
          break;
        case 'rolesetup':
          await this.handleRoleSetup(interaction);
          break;
        case 'welcomeconfig':
          await this.handleWelcomeConfig(interaction);
          break;
        case 'reportset':
          await this.handleReportSet(interaction);
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

  hasConfigPermissions(member) {
    return member.roles.cache.some(role => 
      role.name === ERIFY_ROLES.SUPREME.name || 
      role.name === ERIFY_ROLES.COUNCIL.name ||
      member.permissions.has(PermissionFlagsBits.ManageGuild)
    );
  }

  async handleHelpDeskSet(interaction) {
    const channel = interaction.options.getChannel('channel');

    if (!this.data.helpDeskChannels.includes(channel.id)) {
      this.data.helpDeskChannels.push(channel.id);
      this.saveData();
    }

    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('✅ Help Desk Configured')
      .setDescription(`Auto-thread creation enabled for ${channel}`)
      .addFields({
        name: 'How it works',
        value: 'New messages in this channel will automatically create threads for organized help discussions.',
        inline: false
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  async handleReportSet(interaction) {
    const channel = interaction.options.getChannel('channel');

    if (!this.data.reportChannels.includes(channel.id)) {
      this.data.reportChannels.push(channel.id);
      this.saveData();
    }

    const embed = new EmbedBuilder()
      .setColor(0xFF6B35)
      .setTitle('✅ Report Channel Configured')
      .setDescription(`Auto-thread creation enabled for ${channel}`)
      .addFields({
        name: 'How it works',
        value: 'New reports in this channel will automatically create private threads for investigation.',
        inline: false
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  async handleRoleSetup(interaction) {
    const channel = interaction.options.getChannel('channel');

    const embed = new EmbedBuilder()
      .setColor(0x4169E1)
      .setTitle('🏷️ ERIFY™ Role Selector')
      .setDescription('Choose your role in the ERIFY™ community to access exclusive channels and features.')
      .addFields(
        {
          name: '🔥 Flame Initiates',
          value: ERIFY_ROLES.FLAME.description,
          inline: false
        },
        {
          name: '🌍 Citizens',
          value: ERIFY_ROLES.CITIZENS.description,
          inline: false
        }
      )
      .setFooter({ text: 'Council Guardian and Supreme roles are by invitation only.' })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('role_flame')
          .setLabel('🔥 Flame Initiates')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('role_citizens')
          .setLabel('🌍 Citizens')
          .setStyle(ButtonStyle.Success),
      );

    const message = await channel.send({ embeds: [embed], components: [row] });

    // Store role selector info
    this.data.roleSelectors.push({
      channelId: channel.id,
      messageId: message.id
    });
    this.saveData();

    await interaction.reply({
      content: `✅ Role selector created in ${channel}`,
      ephemeral: true
    });
  }

  async handleWelcomeConfig(interaction) {
    const enabled = interaction.options.getBoolean('enabled');
    const customMessage = interaction.options.getString('message');

    this.data.welcomeConfig.enabled = enabled;
    if (customMessage) {
      this.data.welcomeConfig.message = customMessage;
    }
    this.saveData();

    const embed = new EmbedBuilder()
      .setColor(enabled ? 0x00FF00 : 0xFF0000)
      .setTitle(`${enabled ? '✅' : '❌'} Welcome DMs ${enabled ? 'Enabled' : 'Disabled'}`)
      .setDescription(enabled ? 'New members will receive welcome DMs.' : 'Welcome DMs are disabled.')
      .setTimestamp();

    if (enabled && customMessage) {
      embed.addFields({ name: 'Custom Message Set', value: customMessage.substring(0, 1000) });
    }

    await interaction.reply({ embeds: [embed] });
  }

  async handleButton(interaction) {
    if (interaction.customId.startsWith('role_')) {
      await this.handleRoleButton(interaction);
    }
  }

  async handleRoleButton(interaction) {
    const roleType = interaction.customId.split('_')[1];
    const member = interaction.member;

    let targetRole;
    switch (roleType) {
      case 'flame':
        targetRole = ERIFY_ROLES.FLAME.name;
        break;
      case 'citizens':
        targetRole = ERIFY_ROLES.CITIZENS.name;
        break;
      default:
        return await interaction.reply({ content: '❌ Invalid role selection.', ephemeral: true });
    }

    try {
      const guild = interaction.guild;
      const role = guild.roles.cache.find(r => r.name === targetRole);

      if (!role) {
        return await interaction.reply({
          content: `❌ Role "${targetRole}" not found. Please contact an administrator.`,
          ephemeral: true
        });
      }

      // Remove other ERIFY roles before adding new one
      const erifyRoles = Object.values(ERIFY_ROLES).map(r => r.name);
      const currentErifyRoles = member.roles.cache.filter(r => erifyRoles.includes(r.name));
      
      for (const currentRole of currentErifyRoles.values()) {
        if (currentRole.name !== targetRole) {
          await member.roles.remove(currentRole);
        }
      }

      if (!member.roles.cache.has(role.id)) {
        await member.roles.add(role);
        
        const embed = new EmbedBuilder()
          .setColor(role.color)
          .setTitle('🎉 Role Assigned!')
          .setDescription(`You now have the **${targetRole}** role.`)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
      } else {
        await interaction.reply({
          content: `✅ You already have the **${targetRole}** role.`,
          ephemeral: true
        });
      }
    } catch (error) {
      console.error('Role assignment error:', error);
      await interaction.reply({
        content: '❌ Failed to assign role. Please try again later.',
        ephemeral: true
      });
    }
  }

  async handleAutoThread(message) {
    const channelId = message.channel.id;

    // Check if channel is configured for auto-threads
    if (this.data.helpDeskChannels.includes(channelId)) {
      await this.createHelpThread(message);
    } else if (this.data.reportChannels.includes(channelId)) {
      await this.createReportThread(message);
    }
  }

  async createHelpThread(message) {
    try {
      const threadName = `Help: ${message.author.username} - ${new Date().toLocaleDateString()}`;
      
      const thread = await message.startThread({
        name: threadName,
        autoArchiveDuration: 1440, // 24 hours
        reason: 'Auto-created help desk thread'
      });

      const embed = new EmbedBuilder()
        .setColor(0x4169E1)
        .setTitle('🆘 Help Thread Created')
        .setDescription('Your help request has been organized into this thread. Our community members will assist you here.')
        .addFields({
          name: 'Next Steps',
          value: '• Provide detailed information about your issue\n• Be patient for community responses\n• Tag @Council Guardians if urgent',
          inline: false
        })
        .setTimestamp();

      await thread.send({ embeds: [embed] });
    } catch (error) {
      console.error('Help thread creation error:', error);
    }
  }

  async createReportThread(message) {
    try {
      const threadName = `Report: ${message.author.username} - ${new Date().toLocaleDateString()}`;
      
      const thread = await message.startThread({
        name: threadName,
        autoArchiveDuration: 10080, // 7 days
        reason: 'Auto-created report thread'
      });

      const embed = new EmbedBuilder()
        .setColor(0xFF6B35)
        .setTitle('📋 Report Thread Created')
        .setDescription('Your report has been received and will be investigated by our moderation team.')
        .addFields({
          name: 'What happens next?',
          value: '• Moderators will review your report\n• You may be contacted for additional information\n• All reports are handled confidentially',
          inline: false
        })
        .setTimestamp();

      await thread.send({ embeds: [embed] });

      // Notify moderators
      const councilRole = message.guild.roles.cache.find(r => r.name === ERIFY_ROLES.COUNCIL.name);
      if (councilRole) {
        await thread.send(`${councilRole} - New report requires attention.`);
      }
    } catch (error) {
      console.error('Report thread creation error:', error);
    }
  }

  async handleWelcome(member) {
    if (!this.data.welcomeConfig.enabled) return;

    try {
      const embed = new EmbedBuilder()
        .setColor(0x4169E1)
        .setTitle('Welcome to ERIFY™ World! 🌍✨')
        .setDescription(this.data.welcomeConfig.message)
        .setThumbnail(member.guild.iconURL())
        .addFields({
          name: 'Getting Started',
          value: '🏷️ Get your role in the role selector\n🛡️ Read our community guidelines\n👋 Introduce yourself to the community',
          inline: false
        })
        .setFooter({ text: 'From the ashes to the stars! 🚀' })
        .setTimestamp();

      await member.send({ embeds: [embed] });
    } catch (error) {
      console.error('Welcome DM error:', error);
      // If DM fails, try to send in a welcome channel if configured
      const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;
      if (welcomeChannelId) {
        try {
          const welcomeChannel = await this.client.channels.fetch(welcomeChannelId);
          if (welcomeChannel) {
            await welcomeChannel.send(`Welcome to ERIFY™ World, ${member}! 🌍✨ Check your DMs for getting started info.`);
          }
        } catch (channelError) {
          console.error('Welcome channel error:', channelError);
        }
      }
    }
  }

  start() {
    this.client.login(process.env.ADDON_BOT_TOKEN);
  }
}

// Start the add-on bot
const addonBot = new AddonTool();
addonBot.start();