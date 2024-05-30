const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {

        if (interaction.isChatInputCommand()) {

            console.log('hi');

            await interaction.deferReply();

            const command = await interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            command.execute(interaction).catch(error => {
                console.error(error);
                interaction.editReply('Error Caught:' + error);
            });
        

        }
    }
};
