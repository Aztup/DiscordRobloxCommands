import {randomBytes} from 'crypto';
import {User} from 'discord.js';

const ARG_COMMAND_FAIL_INTERVAL = 5 * 1000; // 5 seconds
const SERVER_TIMEOUT_INTERVAL = 5 * 1000; // 5 seconds

export interface CommandData {
    jobId: string;
    sent: boolean;
    command: string;
    commandId: string;
    args: any[];
    issuer: unknown;
}

interface SendToServerReturnData {
    foundPlayerServer: boolean;
    chosenServer: string;
};

class CommandManager {
    allCommands: CommandData[];
    allServers: string[];
    allPlayers: Map<string, string[]>;
    serverTimeouts: Map<string, NodeJS.Timeout>;

    constructor() {
        this.allCommands = [];
        this.allServers = [];

        this.serverTimeouts = new Map();
        this.allPlayers = new Map();
    }

    onCommandFailSend(commandData: CommandData) {
        if (commandData.sent) return;

        const chosenServer = this.allServers[Math.floor(Math.random() * this.allServers.length)];
        commandData.jobId = chosenServer;

        setTimeout(() => {
            this.onCommandFailSend(commandData);
        }, ARG_COMMAND_FAIL_INTERVAL);
    }

    sendToServer(command: string, args: any[], issuer: User, username = '') : SendToServerReturnData {
        let chosenServer = '';
        let foundPlayerServer = false;

        if (username) {
            this.allPlayers.forEach((playerIds, jobId) => {
                console.log(playerIds, jobId);
    
                if (playerIds.includes(username)) {
                    chosenServer = jobId;
                    foundPlayerServer = true;
                }
            });
        };
        
        if (!foundPlayerServer) {
            chosenServer = this.allServers[Math.floor(Math.random() * this.allServers.length)];
        };

        const commandData = {
            jobId: chosenServer,
            sent: false,
            issuer: issuer.toJSON(),
            command,
            commandId: randomBytes(8).toString('hex'),
            args
        };

        this.allCommands.push(commandData);

        setTimeout(() => {
            this.onCommandFailSend(commandData);
        }, ARG_COMMAND_FAIL_INTERVAL);

        return {
            foundPlayerServer,
            chosenServer
        }
    }

    getCommandsFor(jobId: string) {
        return this.allCommands.filter(commandData => commandData.jobId === jobId);
    }

    removeCommands(commandIds: string[]) {
        commandIds.forEach((commandId: string) => {
            const index = this.allCommands.findIndex((commandData) => commandData.commandId === commandId);
    
            if (index !== -1) {
                this.allCommands[index].sent = true;
                this.allCommands.splice(index, 1);
            }
        });
    }

    serverPing(jobId: string, players: string[]) {
        if (!this.allServers.includes(jobId)) this.allServers.push(jobId);

        const serverTimeout = this.serverTimeouts.get(jobId);
        if (serverTimeout) clearTimeout(serverTimeout);
    
        this.serverTimeouts.set(jobId, setTimeout(() => {
            this.serverTimeouts.delete(jobId);
            this.allServers.splice(this.allServers.indexOf(jobId), 1);
            this.allPlayers.delete(jobId);
        }, SERVER_TIMEOUT_INTERVAL));

        this.allPlayers.set(jobId, players);
    }
}

const commandManager = new CommandManager();

export default commandManager;