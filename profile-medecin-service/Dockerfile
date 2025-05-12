# Utilise l’image officielle de Node.js
FROM node:18

# Crée un dossier pour ton app
WORKDIR /app

# Copie les fichiers nécessaires
COPY package*.json ./

# Installe les dépendances
RUN npm install

# Copie tout le code source
COPY . .

# Expose le port (utiliser la même valeur que celle définie dans .env)
EXPOSE 5003

# Lancement du serveur
CMD ["node", "server.js"]
