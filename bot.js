const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js")
const fs = require("fs")
const config = require("./config.json")
const { v4: uuidv4 } = require("uuid")

const client = new Client({
 intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.DirectMessages
 ]
})

let ticketData = {}

if (fs.existsSync("tickets.json"))
 ticketData = JSON.parse(fs.readFileSync("tickets.json"))

function save() {
 fs.writeFileSync("tickets.json", JSON.stringify(ticketData, null, 2))
}

client.on("ready", () => {
 console.log(`Logged in as ${client.user.tag}`)
})

client.on("messageCreate", async message => {

 if (!message.content.startsWith(config.prefix) || message.author.bot) return

 const args = message.content.slice(config.prefix.length).split(" ")
 const cmd = args.shift().toLowerCase()

 // ADMIN SET CHANNEL
 if (cmd === "setticket") {

 if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
  return message.reply("Admin only")

 const channel = message.mentions.channels.first()

 ticketData.ticketChannel = channel.id
 save()

 message.reply("Ticket channel set!")
 }

 // SEND MESSAGE ANY CHANNEL
 if (cmd === "say") {

 if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
  return

 const channel = message.mentions.channels.first()
 const text = args.slice(1).join(" ")

 channel.send(text)
 }

 // CREATE TICKET
 if (cmd === "ticket") {

 if (!message.member.roles.cache.has(config.ticketRole))
  return message.reply("You can't create tickets")

 const reason = args.join(" ")

 if (!reason) return message.reply("Give reason")

 const code = Math.floor(Math.random()*900000)+100000

 message.author.send(`Your verification code: **${code}**`)

 message.reply("Check DM and send code within 30s")

 const filter = m => m.author.id === message.author.id

 const collected = await message.channel.awaitMessages({
  filter,
  max:1,
  time:30000
 }).catch(()=>{})

 if (!collected) return message.reply("Timeout")

 if (collected.first().content != code) return message.reply("Wrong code")

 const channel = await message.guild.channels.create({
  name:`ticket-${message.author.username}`,
  parent: config.ticketCategory
 })

 channel.send(`
Ticket Created

User: ${message.author}
ID: ${message.author.id}

Reason: ${reason}

RULES
• No spam
• Explain problem clearly
• Wait for staff
`)

 ticketData.total = (ticketData.total || 0) + 1
 save()

 message.reply(`Ticket created: ${channel}`)
 }

})

client.login(config.token)
