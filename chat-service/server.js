const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const chatRoutes = require('./routes/chat.routes');
const setupSocket = require('./socket/socket');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.set('io', io); // Attacher l'instance de Socket.IO à l'application Express
app.use(express.json());
app.use('/api/chat', chatRoutes);

setupSocket(io);

const PORT = process.env.PORT || 5002;

const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`🌐 Chat Service running on port ${PORT}`);
  });
};

startServer();