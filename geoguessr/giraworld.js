const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const Sequelize = require('sequelize');
const fetch = require("node-fetch");
const fs = require('fs');

/*
    This is a country streak game based on Discord.
    Country Streaks is the Geoguessr based game where a player gets a random location on google street view, 
    then they must guess the country that this location is in.
    The more countries you get right in a row, the higher the streak.
*/

// GW = GIRA WORLD (The selection of locations that this game is played on)

const gwStreakChannels = new Array();
const gwStreakIds = new Array();

// This game runs on multiple different text channels, so we use arrays to store all of them

async function addGwChannel(channel, ag) { // This function will just add the channel and location to the arrays
    gwStreakChannels.push(channel); // The channel id of the game
    gwStreakIds.push(ag); // The 2 letter country code of the location
}

async function gwRemoveItems(n) { // This function will remove the channel and country code once a player gives up or answers correctly
    gwStreakChannels.splice(n, 1);
    gwStreakIds.splice(n, 1);
}

//
async function gwGenerateLocation(interaction, type, a) { // generate the location! this function is what's called by the command on Discord!

    let map = 'giraworld'; // set the map. the map is the collection of locations, in this case it is called gira world

    const rawdata = fs.readFileSync(`./geoguessr/maps/${map}.json`); // read the map file json
    const locs = JSON.parse(rawdata);
    const randomLoc = Math.floor(Math.random() * locs.customCoordinates.length) + 1; // obtain the random location for the round
    const loc = locs.customCoordinates[randomLoc]; // gets the coordinates on earth of the location

    // specifications for the location

    const latitude = loc.lat;
    const longitude = loc.lng;
    const size = '720x480';
    const pitch = loc.pitch;
    const heading = loc.heading;
    let panoId = '';

    // call BigDataCloud API to obtain the country that the coordinates are in
    const gwurl = new URL(`https://api-bdc.net/data/reverse-geocode?latitude=${latitude}&longitude=${longitude}&key=${process.env.BDCKEY}
        `);
    const stuff = await fetch(gwurl);
    const json = await stuff.json();

    let ag = json.countryCode; // get the country code of the country, this is used so that discrepancies such as "USA" vs "United States" don't happen

    const cButton = new ButtonBuilder() // Make the button to give up.
        .setLabel('Give Up')
        .setStyle(ButtonStyle.Danger)
        .setCustomId('byeGWloc') // this is the function that will be called in the other script when the button is pressed

    const row = new ActionRowBuilder() // Add the button to the message on discord
        .addComponents(cButton);
    
    if(loc.panoId) { // if the location has a specific way to pan, then add it here
        panoId = `&pano=${loc.panoId}`;
    }

    let file;
    // GET THE LOCATION FROM GOOGLE MAPS
    const url = new URL(`https://maps.googleapis.com/maps/api/streetview?size=${size}&location=${latitude},${longitude}${panoId}&heading=${heading}&pitch=${pitch}&key=${process.env.GMAPSKEY}`);
    await fetch(url).then(async res => {
        let stream = res.body.pipe(fs.createWriteStream('./geoguessr/images/output.png')); // Turn the location into an image
        stream.on('finish', async () => {
            file = new AttachmentBuilder('./geoguessr/images/output.png'); // Add the image to an attatchment for the discord message
            addGwChannel(interaction.channelId, ag); // Add the location to our location storage
            console.log(gwStreakIds, gwStreakChannels); // Console.log for good measure
            if(a==1) { // Send the location in the discord message!
                if(ag == '') { interaction.editReply({content: 'Bugged location, type something random to continue', files: [file], components: [row]}) }
                else { interaction.editReply({files: [file], components: [row]}); }
            } else {
                if(ag == '') { interaction.reply({content: 'Bugged location, type something random to continue', files: [file], components: [row]}) }
                else { interaction.reply({files: [file], components: [row]}); }
            }
            
        });
    });

}

module.exports = { gwGenerateLocation, gwRemoveItems, gwStreakChannels, gwStreakIds, addGwChannel }