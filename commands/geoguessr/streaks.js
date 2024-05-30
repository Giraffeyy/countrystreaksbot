const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const Sequelize = require('sequelize');
const fetch = require("node-fetch");
const fs = require('fs');
const { addGwChannel, gwStreakChannels, gwStreakIds, gwGenerateLocation } = require('../../geoguessr/giraworld');

module.exports = {
    data:  new SlashCommandBuilder()
        .setName('startstreak')
        .setDescription('builds the thing')
        .addStringOption(option =>
            option.setName('type')
            .setDescription('type of streak')
            .setRequired(true)
            .addChoices(
                { name: 'gira world', value: 'gw' },
            )
        ),
    async execute(interaction) { // When they send the command!

        const type = await interaction.options.getString('type');
        gwGenerateLocation(interaction, type, 1); // generate the location!

    }
}