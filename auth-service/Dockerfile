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

# Lancement du serveur
EXPOSE 4000
CMD ["node", "server.js"]
