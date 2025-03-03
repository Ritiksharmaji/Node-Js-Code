
const net = require('net');

const server = net.createServer((socket) => {
    // This callback is called when a new connection is established
    console.log('Client connected');

    // Handle data received from the client
    socket.on('data', (data) => {
        console.log('Received data:', data.toString());
    });

    // Handle the end of the connection
    socket.on('end', () => {
        console.log('Client disconnected');
    });
});

// Set the server to listen on a specific port and IP address
server.listen(3000, '127.0.0.1', () => {
    console.log('Server listening on port 3000');
});
