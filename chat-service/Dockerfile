FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY middlewares ./middlewares
COPY routes ./routes
COPY controllers ./controllers
COPY models ./models
COPY socket ./socket
COPY utils ./utils
COPY config ./config
COPY server.js ./
COPY initGroups.js ./
COPY .env ./
EXPOSE 5002
CMD ["node", "server.js"]