import {config} from 'dotenv';
config();

import express from 'express';
import bot from './bot';

import CommandManager from './CommandManager';

const app = express();
app.use(express.json());

bot.on('interactionCreate', (interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'ban') {
        const {value: username} = interaction.options.get('username') as any;
        const {value: reason} = interaction.options.get('reason') as any;

        const {foundPlayerServer, chosenServer} = CommandManager.sendToServer('ban', [username, reason], interaction.user, username);

        if (foundPlayerServer) {
            interaction.reply(`Found user in a server, sending command to there [${chosenServer}]`);
        } else {
            interaction.reply('Sent request to a server, request will be performed shortly');

            setTimeout(() => {
                interaction.followUp('Request has been successfully performed!');
            }, 5000);
        }
    };
});

app.post('/ping', (req, res) => {
    const {jobId} : {jobId: string} = req.query as any;
    const {players} : {players: string[]} = req.body;

    if (!jobId) return res.status(400).send('Missing jobId');
    if (!players) return res.status(400).send('Missing players');

    CommandManager.serverPing(jobId, players);

    return res.sendStatus(204);
});

app.post('/removeCommand', (req, res) => {
    const {commandIds} = req.body;
    if (!commandIds) return res.status(400).send('Missing commandIds');

    CommandManager.removeCommands(commandIds);

    return res.sendStatus(204);
});

app.get('/list', (req, res) => {
    const {jobId} : {jobId: string} = req.query as any;
    if (!jobId) return res.status(400).send('Missing jobId');

    return res.json(CommandManager.getCommandsFor(jobId));
});

app.listen(3000, () => {
    console.log('listening on port 3000');
});