const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:8080",  // Permite o frontend
        methods: ["GET", "POST"]
    }
});

let adminSocket = null;  // Para rastrear o socket do administrador

app.use(cors());
app.get('/', (req, res) => {
    res.send("Chat server is running");
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Verificar se o usuário é admin
    socket.on('admin connect', () => {
        adminSocket = socket;
        console.log('Admin connected:', socket.id);
    });

    // Quando um cliente solicita iniciar um chat
    socket.on('request chat', (username) => {
        console.log(`${username} wants to start a chat`);

        // Notifica o administrador, se estiver conectado
        if (adminSocket) {
            adminSocket.emit('chat request', { username, socketId: socket.id });
        }
    });

    // Quando o admin aceita a solicitação de chat
    socket.on('accept chat', (clientSocketId) => {
        io.to(clientSocketId).emit('chat accepted');
    });

    // Evento de recebimento de mensagens do cliente e do administrador
    socket.on('chat message', (msg) => {
        console.log('Message received: ', msg);
        io.emit('chat message', msg);  // Envia a mensagem para todos os clientes conectados
    });

    // Evento de desconexão
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

server.listen(3000, () => {
    console.log('Server listening on *:3000');
});
