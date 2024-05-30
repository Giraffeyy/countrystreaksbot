const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const Sequelize = require('sequelize');
const fetch = require("node-fetch");
const fs = require('fs');

module.exports = {
    data:  new SlashCommandBuilder()
        .setName('getloc')
        .setDescription('builds the thing'),
    async execute(interaction) {
        //await interaction.reply('builds');

        let map = 'skewed_mongolia_v4';

        const rawdata = fs.readFileSync(`./builders/geoguessr/maps/${map}.json`);
        const locs = JSON.parse(rawdata);
        const randomLoc = Math.floor(Math.random() * locs.customCoordinates.length) + 1;
        const loc = locs.customCoordinates[randomLoc];

        const latitude = loc.lat;
        const longitude = loc.lng;
        const size = '720x480';
        const pitch = loc.pitch;
        const heading = loc.heading;
        let panoId = '';

        const mnurl = new URL(`https://api-bdc.net/data/reverse-geocode?latitude=${latitude}&longitude=${longitude}&key=
        bdc_578d8277497540439d0c11a94cfdffda`);
        const shit = await fetch(mnurl);
        const json = await shit.json();
        const ag = json.principalSubdivision.slice(0, -6); 

        if(loc.panoId) {
            panoId = `&pano=${loc.panoId}`;
        }

        const url = new URL(`https://maps.googleapis.com/maps/api/streetview?size=${size}&location=${latitude},${longitude}${panoId}&heading=${heading}&pitch=${pitch}&key=AIzaSyAb1fTrbQA58pwDlFb3QRwZVxaBITfyshA`);
        console.log(url);
        await fetch(url).then(async res => {
            let stream = res.body.pipe(fs.createWriteStream('./builders/geoguessr/images/output.png'));   
            stream.on('finish', async () => {
                const file = new AttachmentBuilder('./builders/geoguessr/images/output.png');
                const embed = new EmbedBuilder()
                    .setDescription(ag);
                await interaction.editReply({embeds: [embed], files: [file]});
            });

        });
        
        

    },
}
