import app from './app';
import dgram from 'dgram';
import dotenv from 'dotenv';

dotenv.config();

const PORT = parseInt(process.env.PORT || "3001", 10);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// IPv4 socket
const server4 = dgram.createSocket('udp4');
server4.bind(12345, () => {
    server4.setBroadcast(true);
    console.log('IPv4 UDP server listening');
});

// IPv6 socket
const server6 = dgram.createSocket('udp6');
server6.bind(12345, () => {
    // Join a multicast group, e.g., ff02::1
    server6.addMembership('ff02::1');
    console.log('IPv6 UDP server listening');
});

server4.on('message', (msg, rinfo) => {
  if (msg.toString() === 'DISCOVER_SERVER') {
    const response = Buffer.from(`SERVER_HERE:${PORT}`);
    server4.send(response, rinfo.port, rinfo.address, () => {
      console.log(`4 Responded to discovery from ${rinfo.address}:${rinfo.port}`);
    });
  }
});

server6.on('message', (msg, rinfo) => {
  if (msg.toString() === 'DISCOVER_SERVER') {
    const response = Buffer.from(`SERVER_HERE:${PORT}`);
    server6.send(response, rinfo.port, rinfo.address, () => {
      console.log(`6 Responded to discovery from ${rinfo.address}:${rinfo.port}`);
    });
  }
});