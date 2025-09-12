# 🛡️ ERIFY™ Moderation Kit

The ERIFY™ Moderation Kit provides comprehensive moderation tools for Discord servers, designed specifically for the ERIFY™ role hierarchy and community standards.

## 🚀 Features

### Core Moderation Commands
- **`/mute`** - Temporarily mute users with customizable duration
- **`/unmute`** - Remove mute from users  
- **`/kick`** - Kick users from the server
- **`/ban`** - Ban users with optional message deletion

### Advanced Features
- **🔄 Timed Mutes** - Automatic unmute after specified duration
- **📊 Mod Logs** - Comprehensive action logging with embeds
- **🚫 Anti-Spam** - Automatic spam detection and mitigation
- **⚡ Auto-Expiry** - Background task to handle mute expiration

## 🏗️ Role Hierarchy

The moderation kit respects ERIFY™ role hierarchy:

- **👑 Supreme 4** - Full moderation access
- **🛡 Council Guardians** - Full moderation access  
- **🌍 Citizens** - No moderation access
- **🔥 Flame Initiates** - No moderation access

## 📦 Installation

1. **Install Dependencies**
   ```bash
   npm install discord.js @discordjs/rest discord-api-types
   ```

2. **Set Environment Variables**
   ```env
   MOD_BOT_TOKEN=your_moderation_bot_token
   DISCORD_CLIENT_ID=your_discord_client_id  
   DISCORD_GUILD_ID=your_discord_guild_id
   MOD_LOG_CHANNEL_ID=your_mod_log_channel_id
   ```

3. **Deploy Commands**
   ```bash
   npm run deploy:mod
   ```

4. **Start Moderation Bot**
   ```bash
   npm run mod:bot
   ```

## 🔧 Configuration

### Required Permissions
The bot needs the following Discord permissions:
- **Moderate Members** - For muting/timing out users
- **Kick Members** - For kicking users
- **Ban Members** - For banning users
- **Send Messages** - For responses and logging
- **Embed Links** - For rich embed responses

### Setting Up Mod Logs
1. Create a `#mod-logs` channel in your Discord server
2. Copy the channel ID and set it as `MOD_LOG_CHANNEL_ID` in your environment
3. Ensure the bot has permission to send messages in this channel

## 📋 Command Usage

### Mute Command
```
/mute user:@username duration:1h reason:Spam
```
- **Duration formats**: `1m`, `30m`, `1h`, `2h`, `1d`, `7d`
- **Default duration**: 1 hour if not specified
- **Auto-unmute**: Users are automatically unmuted when duration expires

### Unmute Command  
```
/unmute user:@username reason:Appeal accepted
```

### Kick Command
```
/kick user:@username reason:Violation of rules
```

### Ban Command
```
/ban user:@username reason:Repeated violations delete_messages:1
```
- **Message deletion**: 0-7 days of messages can be deleted

## 🚫 Anti-Spam System

The moderation kit includes automatic spam detection:

- **Threshold**: 5 messages in 10 seconds
- **Action**: 5-minute automatic timeout
- **Exemption**: Council Guardians and Supreme users are exempt
- **Logging**: All anti-spam actions are logged

## 📈 Mod Logs Format

All moderation actions are logged with detailed embeds containing:

- **Target user** with ID
- **Moderator** who performed the action  
- **Reason** for the action
- **Duration** (for mutes)
- **Expiry time** (for timed actions)
- **Timestamp** of the action

## 🔒 Security Features

- **Permission Validation** - Commands only work for authorized roles
- **Rate Limiting** - Built-in protection against command spam
- **Error Handling** - Graceful error handling with user feedback
- **Audit Logging** - Complete action trail for accountability

## 🛠️ Troubleshooting

### Common Issues

**Bot not responding to commands:**
- Verify bot token is correct
- Check bot has required permissions
- Ensure commands are deployed with `npm run deploy:mod`

**Mutes not working:**
- Verify bot has "Moderate Members" permission
- Check bot role is higher than target user roles

**Logs not appearing:**
- Verify `MOD_LOG_CHANNEL_ID` is set correctly
- Check bot can send messages in log channel

### Debug Mode
Set `NODE_ENV=development` for additional console logging.

## 🤝 Support

For support with the ERIFY™ Moderation Kit:
- Check the [ERIFY™ Discord](https://discord.gg/erify)
- Create an issue in the repository
- Contact the development team

---

*Part of the ERIFY™ Discord Server ecosystem - Building luxury digital experiences.*