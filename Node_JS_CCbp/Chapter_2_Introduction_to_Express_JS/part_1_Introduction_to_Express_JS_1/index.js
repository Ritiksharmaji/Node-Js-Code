// Importing the Express framework
const express = require('express'); // Importing Express.js to create a web server

// Creating an Express server instance
const server = express(); // Assigning the Express instance to the 'server' variable

// Defining a route for the root URL ('/')
server.get('/', (request, response) => {
  console.log('Server started...!'); // Logging a message when this route is accessed
  response.send('Hello Ritik Sharma'); // Sending a response to the client
});

// Defining a route to get the current date
server.get('/date', (request, response) => {
  console.log('Fetching current date...'); // Logging when the date route is accessed
  let date_object = new Date(); // Creating a new Date object
  response.send(`Today's date: ${date_object}`); // Sending the current date as a response
});

// Defining a route to serve an HTML file
server.get('/page', (request, response) => {
  console.log('Home page loaded...!'); // Logging when the page route is accessed
  response.sendFile('./page.html', { root: __dirname }); // Sending 'page.html' as a response
});

// Starting the server and listening on port 3000
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000'); // Logging server start confirmation
});
