/*
MIT License

Copyright (c) 2021 King-BR

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const Discord = require("discord.js");
const fs = require("fs");
const utils = require("../../utils/index.js");
const config = require("../../config.json");

var Errors = utils.errorHandler;
var Bundles = utils.translationHandler;
var self = this;

module.exports = {
  /**
   * @param {Discord.Client} client
   * @param {Discord.Message} message
   * @param {String[]} args
   */
  run: function (client, message, args) {
    try {
      var bundle = Bundles.loadBundle();
      if (!args[0]) {
        var embedHelp = new Discord.MessageEmbed()
          .setTitle(bundle.commands.help.title)
          .setDescription(
            bundle.commands.help.desc.replace(/\{0\}/g, config.prefix)
          )
          .setThumbnail(
            client.user.displayAvatarURL({
              dynamic: true,
              size: 512,
              format: "png",
            })
          )
          .setColor("RANDOM")
          .setTimestamp(new Date());

        let commandsFolder = fs.readdirSync("commands");
        commandsFolder.forEach((folder) => {
          if (folder == "test") return console.log("Test folder found");
          var all = fs.readdirSync(`commands/${folder}`);
          var files = all.filter((f) => {
            let dirCheck = isDir(`commands/${folder}/${f}`);
            return f.split(".").slice(-1)[0] === "js" && !dirCheck;
          });

          let cmds = [];
          files.forEach((f) => {
            let pull = require(`../../commands/${folder}/${f}`);
            cmds.push(pull.config.name);
          });

          embedHelp.addField(folder, cmds.join(", "));
        });

        message.channel.send(embedHelp);
      } else {
        args[0] = args[0].toLowerCase();

        let cmd =
          client.commands.get(args[0]) ||
          client.commands.get(client.aliases.get(args[0]));

        if (!cmd) return message.channel.send(bundle.commands.help.noCmd);

        let aliases = bundle.commands.help.noAlias;
        if (cmd.config.aliases && cmd.config.aliases.length > 0)
          aliases = cmd.config.aliases.join(", ");

        let perms = bundle.commands.help.noPerm;
        if (cmd.config.permissions && cmd.config.permissions.lenght > 0)
          perms = cmd.config.permissions.join(", ");

        // prettier-ignore
        var embedExtendedHelp = new Discord.MessageEmbed()
          .setTitle(cmd.config.name)
          .setDescription(`${bundle.commands.help.cmdHelp.desc}: ${cmd.config.desc}`)
          .addFields([
            { name: bundle.commands.help.cmdHelp.usage, value: `${config.prefix}${cmd.config.name} ${cmd.config.usage}\n\n${bundle.commands.help.params}`, inline: true },
            { name: bundle.commands.help.cmdHelp.aliases, value: aliases, inline: true },
            { name: bundle.commands.help.cmdHelp.perm, value: perms, inline: true},
            { name: bundle.commands.help.cmdHelp.guildOnly, value: cmd.config.guildOnly ? bundle.commons.yes : bundle.commons.no, inline: true },
            { name: bundle.commands.help.cmdHelp.dmOnly, value: cmd.config.dmOnly ? bundle.commons.yes : bundle.commons.no, inline: true },
            { name: "\u200b", value: "\u200b", inline: true },
            { name: bundle.commands.help.cmdHelp.ownerOnly, value: cmd.config.ownerOnly ? bundle.commons.yes : bundle.commons.no, inline: true },
            { name: bundle.commands.help.cmdHelp.staffOnly, value: cmd.config.staffOnly ? bundle.commons.yes : bundle.commons.no, inline: true },
            { name: bundle.commands.help.cmdHelp.devOnly, value: cmd.config.devOnly ? bundle.commons.yes : bundle.commons.no, inline: true }
          ])
          .setColor("RANDOM")
          .setTimestamp(new Date());

        message.channel.send(embedExtendedHelp);
      }
    } catch (err) {
      message.channel.send(Errors.newError(err, self.config.name));
    }
  },

  config: {
    name: "help", // Command name
    aliases: ["commands"], // Command aliases, null it there are no aliases
    desc: "See the list of commands or get extended help about one command", // Command description
    usage: "[command name]", // Usage parameters, null if there are no parameters
    permissions: [], // Permission(s) needed to use the command
    guildOnly: false, // Determines whether the command can only be used on a server
    staffOnly: false, // Determines whether the command can only be used by the server staff
    dmOnly: false, // Determines whether the command can only be used on DM
    ownerOnly: false, // Determines whether the command can only be used by the server owner
    devOnly: false, // Determines whether the command can only be used by the dev team
  },
};
