const fs = require('node:fs');
const path = require('node:path');
const { Client, IntentsBitField, Collection, Events, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, Embed, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder } = require('discord.js');
require('dotenv').config();
require("discord-reply");
const { addGwChannel, gwStreakChannels, gwStreakIds, gwGenerateLocation, gwRemoveItems } = require('./geoguessr/giraworld');
// client intents

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
})

// slash command handler

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// event handler

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
        try{
            client.once(event.name, async (...args) => await event.execute(...args));
        } catch (error)
        {
            console.log("error")
        }
		
	} else {
		try{
            client.on(event.name, async (...args) => await event.execute(...args));
        } catch (error)
        {
            console.log("error")
        }
	}
}



// streaks!

client.on('messageCreate', async (message) => {
    if(message.author.bot) { return; }
    if(gwStreakChannels.length<=0) { return; } 
    if(!message.content.startsWith(`?`)) { return; }  // make sure that the message is a guess with the prefix ? 

    let n = 0; // counter for the loop

    gwStreakChannels.forEach(element => { // check all of the location ids to see if they match the guess
        if(message.channelId == element) {
            if(message.content.toLowerCase().startsWith(`?${gwStreakIds[n].toLowerCase()}`)) { // if you find one that matches

                gwRemoveItems(n); // remove it from the storage

                // make a new message with buttons to continue

                const cButton = new ButtonBuilder()
                    .setLabel('Continue')
                    .setStyle(ButtonStyle.Success)
                    .setCustomId('nextGWloc')

                const row = new ActionRowBuilder()
                    .addComponents(cButton);

                    // reply that they got it correct!

                message.reply({content: 'Correct!', components: [row]});

            } else { // if they get it wrong, then reply with X
                message.react('❌');
            }

        }
        n++;
    });


});

client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.isButton()) return; // make sure that the interaction is a button interaction

    if (interaction.customId.includes("byeGWloc")) // if the button is the one to delete the location / give up
    {  

        let a;
        let n = 0;
        gwStreakChannels.forEach(element => { // find the channel id of the button press in the array of channel ids
            if(element == interaction.channelId) { a = gwStreakIds[n]; gwRemoveItems(n); } // if you find it then delete the location successfully.
            n++;
        });

        // create a new message with new buttons so they can continue playing.

        const cButton = new ButtonBuilder()
            .setLabel('Continue')
            .setStyle(ButtonStyle.Success)
            .setCustomId('nextGWloc')

        const row = new ActionRowBuilder()
            .addComponents(cButton);

        // tell them the answer!
        interaction.reply({content: `The location was: ${a}!`, components: [row]});


    }
    else if (interaction.customId.includes("nextGWloc")) // if they select a new location once they get it right
    {

        let g = false;
        
        gwStreakChannels.forEach(element => { // make sure that there isnt already a game running in the current channel
            if(element == interaction.channelId) { interaction.reply("Game already running"); g = true; return; }
        });

        if(g == false) { // if there is space for a game, then start a new round!
            gwGenerateLocation(interaction, 'gw'); 
        }

    }

});

//logs a message in the log channel

async function logMessage(messageToLog)
{
    const logChannel = await client.channels.fetch('1157541315379204107');
    logChannel.send(messageToLog);
}

// logs in the client

client.login(process.env.TOKEN);

// checks if the string is a valid url