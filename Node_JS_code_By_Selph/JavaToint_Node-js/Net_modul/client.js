

const net = require('net');

const client = net.createConnection({ port: 3000, host: '127.0.0.1' }, () => {
    // This callback is called when the connection is established
    console.log('Connected to server');

    // Send data to the server
    client.write('Hello, server!');
});

// Handle data received from the server
client.on('data', (data) => {
    console.log('Received data from server:', data.toString());
});

// Handle the end of the connection
client.on('end', () => {
    console.log('Disconnected from server');
});
