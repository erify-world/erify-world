import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';

// Load environment variables
config();

const commands = [
  {
    name: 'mute',
    description: 'Mute a user in the server',
    options: [
      {
        name: 'user',
        description: 'The user to mute',
        type: 6, // USER type
        required: true,
      },
      {
        name: 'duration',
        description: 'Duration of the mute (e.g., 1h, 30m, 1d)',
        type: 3, // STRING type
        required: false,
      },
      {
        name: 'reason',
        description: 'Reason for the mute',
        type: 3, // STRING type
        required: false,
      },
    ],
  },
  {
    name: 'unmute',
    description: 'Unmute a user in the server',
    options: [
      {
        name: 'user',
        description: 'The user to unmute',
        type: 6, // USER type
        required: true,
      },
      {
        name: 'reason',
        description: 'Reason for the unmute',
        type: 3, // STRING type
        required: false,
      },
    ],
  },
  {
    name: 'kick',
    description: 'Kick a user from the server',
    options: [
      {
        name: 'user',
        description: 'The user to kick',
        type: 6, // USER type
        required: true,
      },
      {
        name: 'reason',
        description: 'Reason for the kick',
        type: 3, // STRING type
        required: false,
      },
    ],
  },
  {
    name: 'ban',
    description: 'Ban a user from the server',
    options: [
      {
        name: 'user',
        description: 'The user to ban',
        type: 6, // USER type
        required: true,
      },
      {
        name: 'reason',
        description: 'Reason for the ban',
        type: 3, // STRING type
        required: false,
      },
      {
        name: 'delete_messages',
        description: 'Delete messages from the last X days (0-7)',
        type: 4, // INTEGER type
        required: false,
        min_value: 0,
        max_value: 7,
      },
    ],
  },
];

const rest = new REST({ version: '10' }).setToken(process.env.MOD_BOT_TOKEN);

try {
  console.log('🔄 Started refreshing moderation application (/) commands.');

  await rest.put(
    Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID),
    { body: commands },
  );

  console.log('✅ Successfully reloaded moderation application (/) commands.');
} catch (error) {
  console.error('❌ Error deploying moderation commands:', error);
}