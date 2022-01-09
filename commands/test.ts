import {SlashCommandBuilder} from '@discordjs/builders';

const commandData = new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user based on his roblox username')
    .addStringOption((option) => {
        option.setName('username')
            .setDescription('Roblox username / id')
            .setRequired(true);

        return option;
    })
    .addStringOption((option) => {
        option.setName('reason')
            .setDescription('Ban reason')
            .setRequired(true);

        return option;
    })

export default {
    data: commandData
};