# 🎉 ERIFY™ Add-on Kit

The ERIFY™ Add-on Kit enhances your Discord server with automated features that improve user engagement and community management. Designed specifically for the ERIFY™ ecosystem.

## 🚀 Features

### Auto-Thread Creation
- **📞 Help Desk Threads** - Automatically creates organized threads for help requests
- **📋 Report Threads** - Creates private investigation threads for reports
- **⏰ Auto-Archive** - Threads auto-archive after configurable periods
- **🏷️ Smart Naming** - Descriptive thread names with user and date

### Welcome System
- **💌 Welcome DMs** - Personalized direct messages for new members
- **🎨 Rich Embeds** - Beautiful welcome messages with server branding
- **📝 Customizable** - Configurable welcome messages
- **🔄 Fallback** - Welcome channel posting if DMs fail

### Interactive Role Selector
- **🏷️ Self-Service Roles** - Members can assign their own roles
- **🎯 ERIFY™ Roles** - Integrated with the ERIFY™ role hierarchy
- **⚡ Instant Assignment** - Real-time role assignment via buttons
- **🔄 Role Switching** - Automatic removal of conflicting roles

## 🏗️ ERIFY™ Roles

The add-on kit supports the complete ERIFY™ role hierarchy:

- **👑 Supreme 4** - *Ultimate access to all ERIFY™ features* (Invite only)
- **🛡 Council Guardians** - *Moderation and community leadership* (Invite only)
- **🌍 Citizens** - *Core community members* (Self-assignable)
- **🔥 Flame Initiates** - *New members beginning their journey* (Self-assignable)

## 📦 Installation

1. **Install Dependencies**
   ```bash
   npm install discord.js @discordjs/rest discord-api-types
   ```

2. **Set Environment Variables**
   ```env
   ADDON_BOT_TOKEN=your_addon_bot_token
   DISCORD_CLIENT_ID=your_discord_client_id
   DISCORD_GUILD_ID=your_discord_guild_id
   WELCOME_CHANNEL_ID=your_welcome_channel_id
   ```

3. **Deploy Commands**
   ```bash
   npm run deploy:addon
   ```

4. **Start Add-on Bot**
   ```bash
   npm run addon:bot
   ```

## 🔧 Configuration Commands

### Help Desk Setup
```
/helpdeskset channel:#help-desk
```
Enables auto-thread creation for help requests in the specified channel.

### Report Channel Setup
```
/reportset channel:#reports
```
Enables auto-thread creation for reports with moderator notifications.

### Role Selector Setup
```
/rolesetup channel:#role-selector
```
Creates an interactive role selector for Citizens and Flame Initiates.

### Welcome Configuration
```
/welcomeconfig enabled:true message:"Custom welcome message"
```
Configures welcome DM settings with optional custom message.

## 📋 Auto-Thread Features

### Help Desk Threads
- **Thread Name**: `Help: username - date`
- **Auto-Archive**: 24 hours of inactivity
- **Welcome Message**: Instructions and guidance
- **Organization**: Keeps help channel clean and organized

### Report Threads
- **Thread Name**: `Report: username - date`  
- **Auto-Archive**: 7 days of inactivity
- **Privacy**: Only accessible to reporter and moderators
- **Notifications**: Automatic Council Guardian mentions

## 🎨 Welcome System Features

### Default Welcome Message
```
Welcome to ERIFY™ World! 🌍✨

You've joined a community dedicated to luxury digital experiences and innovation. Here's how to get started:

🔥 Get your role in the role selector to access exclusive channels
🛡️ Read our guidelines to understand our community standards  
👑 Explore and connect with fellow Citizens and Guardians

From the ashes to the stars! 🚀
```

### Welcome DM Failure Handling
- **Primary**: Attempts to send DM to new member
- **Fallback**: Posts welcome in designated welcome channel
- **Logging**: Errors are logged for debugging

## 🏷️ Role Selector Features

### Interactive Buttons
- **🔥 Flame Initiates** - Primary blue button
- **🌍 Citizens** - Success green button

### Smart Role Management
- **Conflict Resolution**: Removes conflicting ERIFY™ roles automatically
- **Duplicate Prevention**: Checks for existing roles before assignment
- **Error Handling**: Graceful handling of permission issues

### Visual Design
- **Rich Embeds**: Professional role selection interface
- **Role Descriptions**: Clear explanations of each role
- **Color Coding**: Role-specific colors for visual clarity

## 💾 Data Persistence

The add-on kit uses `addon-data.json` for lightweight data storage:

```json
{
  "helpDeskChannels": ["channel_id_1", "channel_id_2"],
  "reportChannels": ["channel_id_3"],
  "roleSelectors": [
    {
      "channelId": "channel_id_4",
      "messageId": "message_id_1"
    }
  ],
  "welcomeConfig": {
    "enabled": true,
    "message": "Custom welcome message..."
  }
}
```

## 🔒 Security & Permissions

### Required Bot Permissions
- **Send Messages** - For responses and embeds
- **Manage Threads** - For auto-thread creation
- **Create Public Threads** - For help desk threads
- **Create Private Threads** - For report threads
- **Manage Roles** - For role assignment
- **Embed Links** - For rich embed responses

### Configuration Permissions
Configuration commands require one of:
- **🛡 Council Guardians** role
- **👑 Supreme 4** role  
- **Manage Guild** permission

## 🛠️ Troubleshooting

### Common Issues

**Commands not working:**
- Verify bot token and permissions
- Check commands are deployed with `npm run deploy:addon`
- Ensure bot is in the correct guild

**Role assignment failing:**
- Verify bot has "Manage Roles" permission
- Check bot role is higher than assignable roles
- Ensure target roles exist in the server

**Threads not creating:**
- Verify bot has thread permissions
- Check channel allows thread creation
- Ensure bot isn't rate limited

**Welcome DMs not sending:**
- Check member's DM settings
- Verify welcome channel is configured as fallback
- Review console logs for specific errors

### Data File Issues
If `addon-data.json` becomes corrupted:
1. Stop the bot
2. Delete the corrupted file
3. Restart the bot (will create fresh file)
4. Reconfigure channels as needed

## 📊 Monitoring & Logs

The add-on bot provides console logging for:
- **Startup Status** - Bot ready confirmation
- **Command Execution** - Success and error logging  
- **Thread Creation** - Auto-thread creation events
- **Role Assignment** - Role changes and conflicts
- **Error Handling** - Detailed error information

## 🔄 Integration with Moderation Kit

The Add-on Kit is designed to work alongside the Moderation Kit:
- **Shared Role System** - Same ERIFY™ role hierarchy
- **Compatible Permissions** - Non-conflicting permission requirements
- **Complementary Features** - Enhanced server management when used together

## 🤝 Support

For support with the ERIFY™ Add-on Kit:
- Check the [ERIFY™ Discord](https://discord.gg/erify)
- Create an issue in the repository
- Contact the development team

---

*Part of the ERIFY™ Discord Server ecosystem - Building luxury digital experiences.*