/*
to run this is project there  is two ways 
1) by direct using terminal like - node app.js
2) by using npm for that we need to inject the this app dependency to package.json
  like- "start": "node app.js" in object of script. so to start in just 'npm start' then project will start from this app.

  then install the express-js like -: npm install express

        in the package.json we have change some thing

        // "start": "node app.js" beacuse if we are using the node then to run the file we need to save it and run it but it the 
    // using the nodemon  need to save it only not run

*/


var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ankitritiksharma@gmail.com',
    pass: 'Ritiksharma6209440'
  }
});

var mailOptions = {
  from: 'ankitritiksharma@gmail.com',
  to: 'riitksharma555598@gmail.com',
  subject: 'Sending Email using Node.js',
  text: 'That was easy to sen the mail by node-js!'
};

transporter.sendMail(mailOptions, function (error, info) {
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});

console.log("project started");
console.log("this is ritik sharma")