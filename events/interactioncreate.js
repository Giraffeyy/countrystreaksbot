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

//if (interaction.commandName === 'initialize') return;
/*

const dbServerID = await interaction.guildId;
            const serverDb = await client.guildSettings.findOne({ where: { serverID: dbServerID } })*/

/*async function executeCommand(interaction, command) {

    

}*/

/*if (interaction.replied || interaction.deferred) {
            try {
                await interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
                console.log("error lol")
            }
            catch (error) {
                await interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
                console.log(error)
            }
        } else {
            try {
                await interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
                console.log("error lol")
            }
            catch (error) {
                await interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
                console.log(error)
            }
        }*/
