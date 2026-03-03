const { Server } = require("socket.io");

let ioInstance = null;

const initSocket = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    transports: ["websocket", "polling"]
  });

  ioInstance.on("connection", (socket) => {
    console.log(`[socket] client connected: ${socket.id}`);

    socket.on("disconnect", (reason) => {
      console.log(`[socket] client disconnected: ${socket.id} (${reason})`);
    });
  });

  return ioInstance;
};

const getIO = () => {
  if (!ioInstance) {
    throw new Error("Socket.IO has not been initialized.");
  }

  return ioInstance;
};

module.exports = {
  initSocket,
  getIO
};
