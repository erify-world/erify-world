import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';

// Load environment variables
config();

const commands = [
  {
    name: 'helpdeskset',
    description: 'Configure auto-thread creation for help desk channels',
    options: [
      {
        name: 'channel',
        description: 'The channel to enable auto-threads for',
        type: 7, // CHANNEL type
        required: true,
        channel_types: [0], // GUILD_TEXT
      },
    ],
  },
  {
    name: 'rolesetup',
    description: 'Set up interactive role selector for ERIFY roles',
    options: [
      {
        name: 'channel',
        description: 'The channel to place the role selector in',
        type: 7, // CHANNEL type
        required: true,
        channel_types: [0], // GUILD_TEXT
      },
    ],
  },
  {
    name: 'welcomeconfig',
    description: 'Configure welcome DM settings',
    options: [
      {
        name: 'enabled',
        description: 'Enable or disable welcome DMs',
        type: 5, // BOOLEAN type
        required: true,
      },
      {
        name: 'message',
        description: 'Custom welcome message (optional)',
        type: 3, // STRING type
        required: false,
      },
    ],
  },
  {
    name: 'reportset',
    description: 'Configure auto-thread creation for report channels',
    options: [
      {
        name: 'channel',
        description: 'The channel to enable report threads for',
        type: 7, // CHANNEL type
        required: true,
        channel_types: [0], // GUILD_TEXT
      },
    ],
  },
];

const rest = new REST({ version: '10' }).setToken(process.env.ADDON_BOT_TOKEN);

try {
  console.log('🔄 Started refreshing add-on application (/) commands.');

  await rest.put(
    Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID),
    { body: commands },
  );

  console.log('✅ Successfully reloaded add-on application (/) commands.');
} catch (error) {
  console.error('❌ Error deploying add-on commands:', error);
}