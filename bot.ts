import {readdirSync} from 'fs';
import {REST} from '@discordjs/rest';
import {Client, Intents} from 'discord.js';
import {Routes} from 'discord-api-types/v9';

const bot = new Client({
    intents: [Intents.FLAGS.GUILDS]
});

const commandFiles = readdirSync('./commands').filter(file => file.endsWith('.ts'));
const commands: any = [];

const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN!);

commandFiles.forEach((file) => {
    const commandData = require(`./commands/${file}`).default;
    commands.push(commandData.data);
});

bot.on('ready', async () => {
    await rest.put(Routes.applicationGuildCommands('912348320935084052', '789525430209085440'), {
        body: commands
    });
});

bot.login(process.env.BOT_TOKEN);

export default bot;