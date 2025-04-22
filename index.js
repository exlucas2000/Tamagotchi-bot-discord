// index.js require('dotenv').config(); const { Client, GatewayIntentBits, Collection } = require('discord.js'); const express = require('express'); const fs = require('fs'); const app = express(); const client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent ] });

// Fake HTTP server for Render app.get('/', (req, res) => { res.send('Bot is running!'); }); app.listen(3000, () => console.log('Fake server up'));

client.commands = new Collection();

const animalData = {}; const animalsList = [ { name: 'Chien', prix: 0, sante: 'fragile' }, { name: 'Chat', prix: 100, sante: 'moyenne' }, { name: 'Dragon', prix: 1000, sante: 'forte' }, { name: 'Lapin', prix: 0, sante: 'fragile' } ];

function initAnimal(userId, name, type) { animalData[userId] = { nom: name, type, faim: 100, soif: 100, joie: 100, age: 0, vivant: true }; }

client.on('messageCreate', async message => { if (!message.content.startsWith('+') && !message.content.startsWith('?')) return; const args = message.content.slice(1).split(/ +/); const command = args.shift().toLowerCase(); const userId = message.author.id;

if (command === 'acheter-animal') { const nom = args[0]; const animal = animalsList.find(a => a.name.toLowerCase() === nom.toLowerCase()); if (!animal) return message.reply("Animal introuvable. Utilise +liste-animal"); initAnimal(userId, nom, animal); return message.reply(Tu as adopté un ${nom} (${animal.prix === 0 ? 'gratuit' : animal.prix + ' pièces'}) !); }

if (command === 'liste-animal') { const list = animalsList.map(a => ${a.name} (${a.prix} pièces, santé ${a.sante})).join('\n'); return message.reply('Liste des animaux disponibles :\n' + list); }

if (command === 'nourir-animal') { if (!animalData[userId]) return message.reply("Tu n'as pas encore d'animal !"); animalData[userId].faim = Math.min(animalData[userId].faim + 20, 100); return message.reply("Ton animal a été nourri !"); }

if (command === 'boire-animal') { if (!animalData[userId]) return message.reply("Tu n'as pas encore d'animal !"); animalData[userId].soif = Math.min(animalData[userId].soif + 20, 100); return message.reply("Ton animal a bu de l'eau !"); }

if (command === 'amuser-animal') { if (!animalData[userId]) return message.reply("Tu n'as pas encore d'animal !"); const action = args[0] || 'jouer'; animalData[userId].joie = Math.min(animalData[userId].joie + 20, 100); return message.reply(Tu as ${action} avec ton animal ! Il est plus heureux.); }

if (command === 'sente' || command === 'senté') { if (!animalData[userId]) return message.reply("Tu n'as pas encore d'animal !"); const a = animalData[userId]; return message.reply(Santé de ${a.nom} : Faim ${a.faim} | Soif ${a.soif} | Joie ${a.joie} | Âge ${a.age}); }

if (command === 'animal') { if (!animalData[userId]) return message.reply("Tu n'as pas encore d'animal !"); const a = animalData[userId]; return message.reply(Voici ton animal : ${a.nom} \nFaim: ${a.faim}\nSoif: ${a.soif}\nJoie: ${a.joie}\nÂge: ${a.age}); } });

setInterval(() => { for (const userId in animalData) { const a = animalData[userId]; if (!a.vivant) continue; a.faim -= 5; a.soif -= 5; a.joie -= 5; a.age += 1; if (a.faim <= 0 || a.soif <= 0 || a.joie <= 0) { a.vivant = false; } } }, 60000); // toutes les minutes

client.login(process.env.TOKEN);

