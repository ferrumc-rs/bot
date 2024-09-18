import { SlashCommandBuilder} from 'discord.js';
export const command = {
    name: 'ping',
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction: any): Promise<void> {
        await interaction.reply('Pong!');
    }
};