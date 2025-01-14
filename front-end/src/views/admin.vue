<template>
  <div class="chat-container">
    <h2>Admin - Chat</h2>
    <div v-if="requests.length > 0">
      <h3>Solicitações de Chat</h3>
      <ul>
        <li v-for="(request, index) in requests" :key="index">
          {{ request.username }} 
          <button @click="acceptChat(request.socketId)">Aceitar</button>
        </li>
      </ul>
    </div>
    <div v-else-if="!isChatActive">
      <p>Nenhuma solicitação de chat no momento.</p>
    </div>
    <div v-if="isChatActive">
      <h3>Chat Ativo</h3>
      <div class="messages">
        <div v-for="(message, index) in messages" :key="index" class="message">
          {{ message.from }} {{ message.content }}
        </div>
      </div>
      <input v-model="inputMessage" @keyup.enter="sendMessage" placeholder="Digite sua mensagem..." />
    </div>
  </div>
</template>

<script>
import { io } from "socket.io-client";

export default {
  name: 'chat-admin',

  data() {
    return {
      socket: null,
      inputMessage: "",
      messages: [],
      requests: [],
      isChatActive: false,
      activeClient: null, // ID do cliente com o qual está interagindo
    };
  },
  mounted() {
    // Conecta ao servidor Socket.io como admin
    this.socket = io("http://localhost:3000");

    // Envia sinal de que é o admin
    this.socket.emit("admin connect");

    // Recebe solicitações de chat
    this.socket.on("chat request", (request) => {
      this.requests.push(request);
    });

    // Remove solicitações atendidas
    this.socket.on("chat taken", ({ clientSocketId }) => {
      this.requests = this.requests.filter(req => req.socketId !== clientSocketId);
    });

    // Recebe mensagens do servidor
    this.socket.on("chat message", (msg) => {
      this.messages.push(msg);
    });

    // Notifica o administrador se o chat terminar
    this.socket.on("chat ended", (reason) => {
      alert(`Chat encerrado: ${reason}`);
      this.endChat();
    });
  },
  methods: {
    acceptChat(socketId) {
      // Aceita a solicitação de chat
      this.socket.emit("accept chat", socketId);
      this.isChatActive = true;
      this.activeClient = socketId; // Armazena o ID do cliente
      this.requests = []; // Limpa as solicitações
    },
    sendMessage() {
    if (this.inputMessage.trim()) {
      const message = {
        from: 'Admin',
        content: this.inputMessage
      };
      this.socket.emit("chat message", message); // Envia para o servidor
      this.messages.push(message); // Adiciona localmente no admin
      this.inputMessage = ""; // Limpa o campo de entrada
    }
  },
    endChat() {
      // Encerra o chat ativo
      this.isChatActive = false;
      this.activeClient = null;
      this.messages = [];
    }
  },
  beforeUnmount() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
};
</script>

<style scoped>
 :global(body) { 
  background-color: #4D1032; 
}
.chat-container {
  max-width: 80%;
  height: 50%;
  margin: 50px auto;
  border-radius: 10px;
  overflow: hidden;
  background-color:rgb(255, 255, 255); /* Fundo do contêiner principal */
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  flex-direction: column;
}

.chat-container h2 {
  background-color: #802062; /* Fundo do cabeçalho */
  color: #fff;
  text-align: center;
  padding: 15px;
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}
.messages {
  border: 1px solid #ddd;
  height: 300px;
  overflow-y: scroll;
  margin-bottom: 10px;
  padding: 10px;
}

.message {
  margin-bottom: 10px;
  padding: 5px;
  border-bottom: 1px solid #eee;
}

input, button {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  margin-top: 10px;
}
</style>
