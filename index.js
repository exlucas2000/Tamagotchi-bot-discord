require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const app = express();
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot Tamagotchi en ligne !'));
app.listen(port, () => console.log(`Serveur HTTP en écoute sur le port ${port}`));

// Base de données en mémoire
const users = {};
const animalsList = [
  { name: 'chien', prix: 0 },
  { name: 'chat', prix: 0 },
  { name: 'dragon', prix: 100 },
  { name: 'poule', prix: 0 },
  { name: 'licorne', prix: 250 },
];

function initAnimal(userId, nom, animal) {
  if (!users[userId]) {
    users[userId] = {
      coins: 100,
      animal: {
        nom,
        type: animal.name,
        faim: 100,
        soif: 100,
        joie: 100,
        santé: 100,
        age: 0,
        premium: animal.prix > 0
      }
    };
  }
}

// Commandes
client.on('messageCreate', message => {
  if (!message.content.startsWith('+') && !message.content.startsWith('?')) return;

  const args = message.content.slice(1).split(/ +/);
  const command = args.shift().toLowerCase();
  const userId = message.author.id;

  if (command === 'acheter-animal') {
    const nom = args[0];
    if (!nom) return message.reply("Tu dois choisir un nom d'animal !");
    const animal = animalsList.find(a => a.name.toLowerCase() === nom.toLowerCase());
    if (!animal) return message.reply("Animal introuvable. Utilise +liste-animal pour voir les animaux disponibles.");

    if (!users[userId]) users[userId] = { coins: 100, animal: null };
    if (animal.prix > users[userId].coins) return message.reply("Tu n’as pas assez de pièces !");
    
    users[userId].coins -= animal.prix;
    initAnimal(userId, nom, animal);
    return message.reply(`Tu as adopté un **${nom}** (${animal.prix === 0 ? 'gratuit' : animal.prix + ' pièces'}) !`);
  }

  if (command === 'liste-animal') {
    const list = animalsList.map(a => `- ${a.name} (${a.prix === 0 ? 'gratuit' : a.prix + ' pièces'})`).join('\n');
    return message.reply("Liste des animaux disponibles :\n" + list);
  }

  if (command === 'nourir-animal') {
    const user = users[userId];
    if (!user || !user.animal) return message.reply("Tu n’as pas encore d’animal !");
    user.animal.faim = Math.min(100, user.animal.faim + 20);
    return message.reply("Tu as nourri ton animal !");
  }

  if (command === 'boire-animal') {
    const user = users[userId];
    if (!user || !user.animal) return message.reply("Tu n’as pas encore d’animal !");
    user.animal.soif = Math.min(100, user.animal.soif + 20);
    return message.reply("Ton animal a bu !");
  }

  if (command === 'amuser-animal') {
    const user = users[userId];
    if (!user || !user.animal) return message.reply("Tu n’as pas encore d’animal !");
    const activité = args[0] || 'jouer';
    user.animal.joie = Math.min(100, user.animal.joie + 20);
    return message.reply(`Tu as fait ${activité} avec ton animal !`);
  }

  if (command === 'santé') {
    const user = users[userId];
    if (!user || !user.animal) return message.reply("Tu n’as pas encore d’animal !");
    const { santé, faim, soif, joie } = user.animal;
    return message.reply(`Santé: ${santé}\nFaim: ${faim}\nSoif: ${soif}\nJoie: ${joie}`);
  }

  if (command === 'animal') {
    const user = users[userId];
    if (!user || !user.animal) return message.reply("Tu n’as pas encore d’animal !");
    const a = user.animal;
    return message.reply(`Ton animal **${a.nom}** (${a.type})\nSanté: ${a.santé}\nFaim: ${a.faim}\nSoif: ${a.soif}\nJoie: ${a.joie}\nÂge: ${a.age} jour(s)\n${a.premium ? 'Animal premium' : 'Animal gratuit'}`);
  }
});

// Vieillissement et gestion automatique
setInterval(() => {
  for (const userId in users) {
    const user = users[userId];
    if (!user.animal) continue;
    const a = user.animal;
    a.age += 1;
    a.faim -= 5;
    a.soif -= 5;
    a.joie -= 3;

    if (a.faim <= 0 || a.soif <= 0 || a.joie <= 0) a.santé -= 10;
    if (!a.premium && a.age % 3 === 0) a.santé -= 5;

    a.faim = Math.max(0, a.faim);
    a.soif = Math.max(0, a.soif);
    a.joie = Math.max(0, a.joie);
    a.santé = Math.max(0, a.santé);
  }
}, 1000 * 60 * 5); // Toutes les 5 minutes

client.login(process.env.TOKEN);
