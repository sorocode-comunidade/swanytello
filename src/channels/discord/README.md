# Discord channel

This folder implements the **Discord** bot: messages, interactions, and optional slash commands.

## Role

- Connect as a Discord bot and receive events (messages, interactions).
- Reply in channels or DMs.
- Optional: slash commands, buttons, modals.

## Suggested stack

- **discord.js** – Common Node.js library for Discord bots (events, commands, gateway).

## Environment variables (examples)

- `DISCORD_TOKEN` – Bot token from Discord Developer Portal.
- `DISCORD_CLIENT_ID` – Application (client) ID for slash command registration.

## Suggested internal structure

Add when implementing:

- **client/** – Discord client setup, login, and connection.
- **events/** – Event handlers (e.g. `messageCreate`, `interactionCreate`).
- **commands/** – Slash or text commands (optional).
- **config.ts** – Load and expose env/config for this channel.

Implementation will follow when the Discord bot is built.
