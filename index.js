// index.js require('dotenv').config(); const { Client, GatewayIntentBits } = require('discord.js'); const express = require('express'); const app = express(); const client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent ] });

// Mini faux serveur HTTP pour Render app.get('/', (req, res) => { res.send('Bot Tamagotchi en ligne !'); }); app.listen(3000, () => { console.log('Serveur HTTP faux démarré sur le port 3000'); });

// Base de données animale en mémoire const animalData = {}; const animalsList = [ { name: 'Chien', prix: 0, sante: 'fragile' }, { name: 'Chat', prix: 100, sante: 'moyenne' }, { name: 'Dragon', prix: 1000, sante: 'forte' }, { name: 'Lapin', prix: 0, sante: 'fragile' }, { name: 'Licorne', prix: 5000, sante: 'légendaire' } ];

function initAnimal(userId, name, animalType) { animalData[userId] = { nom: name, type: animalType.name, faim: 100, soif: 100, joie: 100, age: 0, vivant: true, sante: animalType.sante }; }

client.on('messageCreate', async (message) => { if (!message.content.startsWith('+') && !message.content.startsWith('?')) return; const args = message.content.slice(1).split(/ +/); const command = args.shift().toLowerCase(); const userId = message.author.id;

if (command === 'acheter-animal') { const nom = args[0]; if (!nom) return message.reply("Tu dois choisir un nom d'animal !"); const animal = animalsList.find(a => a.name.toLowerCase() === nom.toLowerCase()); if (!animal) return message.reply("Animal introuvable. Utilise +liste-animal pour voir les animaux disponibles."); initAnimal(userId, nom, animal); return message.reply(`Tu as adopté un ${nom} (${animal.prix === 0 ? 'gratuit' : animal.prix + ' pièces'`}) !); }

if (command === 'liste-animal') { const list = animalsList.map(a => ${a.name} (${a.prix} pièces, santé ${a.sante})).join('\n'); return message.reply('Liste des animaux disponibles :\n' + list); }

if (command === 'nourir-animal') { const a = animalData[userId]; if (!a) return message.reply("Tu n'as pas encore d'animal !"); a.faim = Math.min(a.faim + 25, 100); return message.reply("Ton animal a été nourri !"); }

if (command === 'boire-animal') { const a = animalData[userId]; if (!a) return message.reply("Tu n'as pas encore d'animal !"); a.soif = Math.min(a.soif + 25, 100); return message.reply("Ton animal a bu de l'eau !"); }

if (command === 'amuser-animal') { const a = animalData[userId]; if (!a) return message.reply("Tu n'as pas encore d'animal !"); const action = args[0] || 'joué'; a.joie = Math.min(a.joie + 25, 100); return message.reply(Tu as ${action} avec ton animal. Il est plus heureux !); }

if (command === 'senté' || command === 'sente') { const a = animalData[userId]; if (!a) return message.reply("Tu n'as pas encore d'animal !"); return message.reply(Santé de ${a.nom} : Faim ${a.faim} | Soif ${a.soif} | Joie ${a.joie} | Âge ${a.age} | Santé ${a.sante}); }

if (command === 'animal') { const a = animalData[userId]; if (!a) return message.reply("Tu n'as pas encore d'animal !"); return message.reply(Ton animal : ${a.nom} (type ${a.type})\nFaim : ${a.faim}\nSoif : ${a.soif}\nJoie : ${a.joie}\nÂge : ${a.age}); } });

setInterval(() => { for (const userId in animalData) { const a = animalData[userId]; if (!a.vivant) continue; a.faim -= 5; a.soif -= 5; a.joie -= 5; a.age += 1;

if (a.faim <= 0 || a.soif <= 0 || a.joie <= 0) {
  a.vivant = false;
}

} }, 60000); // toutes les minutes

client.login(process.env.TOKEN);

