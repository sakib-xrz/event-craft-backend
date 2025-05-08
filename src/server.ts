import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import config from './app/config';
import { initializeSocketIO } from './app/socket';

process.on('uncaughtException', (err) => {
  console.error(err);
  process.exit(1);
});

let server: HttpServer | null = null;
let io: SocketIOServer | null = null;

async function startServer() {
  server = new HttpServer(app);

  // Initialize Socket.IO with CORS
  io = new SocketIOServer(server, {
    cors: {
      origin: ['http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Initialize socket handlers
  initializeSocketIO(io);

  server.listen(config.port, () => {
    console.log(`🎯 Server listening on port: ${config.port}`);
    console.log(`🔌 Socket.IO initialized`);
  });

  process.on('unhandledRejection', (error) => {
    if (server) {
      server.close(() => {
        console.log(error);
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
}

startServer();

process.on('SIGTERM', () => {
  if (server) {
    server.close();
  }
});
