import { io } from "socket.io-client";

const socketUrl =
  process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

const socket = io(socketUrl, {
  transports: ["websocket"],
  autoConnect: false, // IMPORTANT
});

export default socket;
