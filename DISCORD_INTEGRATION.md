# 🤖 ERIFY™ Discord Server Integration Guide

This repository now includes the **ERIFY™ Moderation & Add-on Kits** - drop-in modules that transform your Discord server into a luxury digital community experience.

## 🎯 What's Included

### 🛡️ Moderation Kit
- **Commands**: `/mute`, `/unmute`, `/kick`, `/ban`
- **Features**: Mod-log functionality, anti-spam measures, timed mute capabilities
- **Smart Logging**: Comprehensive action tracking with rich embeds

### 🎉 Add-on Kit
- **Auto-Threads**: Help desk and report channel organization
- **Welcome System**: Personalized DMs for new members
- **Role Selector**: Interactive role assignment for ERIFY™ roles

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy the environment template and fill in your Discord bot credentials:
```bash
cp .env.merge.example .env
```

Edit `.env` with your actual values:
```env
# Discord Bot Configuration
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_discord_client_id_here
DISCORD_GUILD_ID=your_discord_guild_id_here

# Moderation Bot Configuration
MOD_BOT_TOKEN=your_moderation_bot_token_here
MOD_LOG_CHANNEL_ID=your_mod_log_channel_id_here

# Add-on Bot Configuration  
ADDON_BOT_TOKEN=your_addon_bot_token_here
WELCOME_CHANNEL_ID=your_welcome_channel_id_here
```

### 3. Deploy and Start

**Moderation Kit:**
```bash
npm run deploy:mod  # Deploy slash commands
npm run mod:bot     # Start moderation bot
```

**Add-on Kit:**
```bash
npm run deploy:addon  # Deploy slash commands
npm run addon:bot     # Start add-on bot
```

## 🏗️ ERIFY™ Role Hierarchy

The Discord kits are designed around the ERIFY™ role system:

| Role | Access Level | Permissions |
|------|-------------|-------------|
| 👑 **Supreme 4** | Ultimate | All moderation & configuration |
| 🛡 **Council Guardians** | Moderation | All moderation & configuration |
| 🌍 **Citizens** | Member | Standard server access |
| 🔥 **Flame Initiates** | New Member | Basic server access |

## 📋 Configuration Commands

### Help Desk Setup
```
/helpdeskset channel:#help-desk
```
Enables auto-thread creation for organized help discussions.

### Role Selector Setup
```
/rolesetup channel:#role-selector
```
Creates interactive buttons for Citizens and Flame Initiates roles.

### Welcome Configuration
```
/welcomeconfig enabled:true message:"Custom welcome message"
```

### Report Channel Setup
```
/reportset channel:#reports
```
Auto-creates threads for reports with moderator notifications.

## 🔧 Bot Permissions Required

### Moderation Bot
- Moderate Members (for muting)
- Kick Members
- Ban Members
- Send Messages
- Embed Links

### Add-on Bot
- Send Messages
- Manage Threads
- Create Public Threads
- Create Private Threads
- Manage Roles
- Embed Links

## 📁 File Structure

```
├── moderation/
│   ├── deploy-mod-commands.mjs    # Deploys moderation slash commands
│   ├── mod-tool.mjs               # Main moderation bot logic
│   └── README_MODERATION.md       # Detailed moderation documentation
├── addon/
│   ├── deploy-addon-commands.mjs  # Deploys add-on slash commands
│   ├── addon-tool.mjs             # Main add-on bot logic
│   ├── addon-data.json            # Persistent add-on configuration
│   └── README_ADDON.md            # Detailed add-on documentation
├── package.json                   # Main package file with scripts
├── package.merge.json             # Merge template for existing projects
└── .env.merge.example             # Environment template
```

## 🔄 Integration with Existing Projects

If you have an existing Discord bot project, you can integrate these kits:

1. **Merge package.json scripts:**
   ```bash
   # Copy scripts from package.merge.json to your package.json
   ```

2. **Add environment variables:**
   ```bash
   # Append variables from .env.merge.example to your .env
   ```

3. **Copy kit directories:**
   ```bash
   cp -r moderation/ your-project/
   cp -r addon/ your-project/
   ```

## 🛠️ Development & Customization

### Modifying Commands
Edit the command arrays in:
- `moderation/deploy-mod-commands.mjs`
- `addon/deploy-addon-commands.mjs`

Then redeploy with the respective deploy scripts.

### Custom Welcome Messages
Configure via the `/welcomeconfig` command or edit `addon/addon-data.json` directly.

### Role Customization
Modify the `ERIFY_ROLES` object in both bot files to match your server's role names.

## 📊 Monitoring & Logs

### Console Output
Both bots provide detailed console logging for:
- Startup confirmation
- Command execution
- Error handling
- Anti-spam actions

### Discord Logs
The moderation kit logs all actions to a designated mod-log channel with rich embeds.

## 🔒 Security Features

- **Permission Validation**: Commands require appropriate roles
- **Rate Limiting**: Built-in protection against spam
- **Error Handling**: Graceful failure with user feedback
- **Audit Trail**: Complete action logging for accountability

## 🤝 Support & Community

- **Documentation**: Comprehensive READMEs in each kit folder
- **Discord Server**: [Join ERIFY™ Discord](https://discord.gg/erify)
- **Issues**: Report bugs via GitHub issues
- **Development**: Contributions welcome via pull requests

## 📈 Roadmap

Future enhancements planned:
- Advanced moderation analytics
- Custom role reaction systems
- Integration with ERIFY™ ecosystem services
- Multi-language support

---

*Built with ❤️ for the ERIFY™ community - From the ashes to the stars! 🚀*