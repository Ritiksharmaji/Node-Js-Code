## Introduction to EXPRESS JS Part 3

- Third-Party Packages
  - nodemon
- SQLite Methods
  - get()
  - run()

By Ritik -----
step-1: install the npm: npm install 
step-2: create API for  to get single book list
step-3: when ever we are changing something in our code we need to 
        restart the server to ovide it we can install a package 
        called as Nodemon by : npm install -g nodemon
        --------------
        to start the nodemon type: nodemon index.js
-------------------------
for the post method : to add the content into database,
step-1: app.use(express.json()) - write on the top (express.json() is used to recorgnize the incoming request objects as JSON object  and parse it )
step-2: write api for post method 
step-3: 



Content-Type: application/json

{
  "title": "Harry Potter and the Order of the Phoenix",
  "authorId": 1,
  "rating": 4.62,
  "ratingCount": 126559,
  "reviewCount": 611,
  "description": "There is a door at the end of a silent corridor.",
  "pages": 352,
  "dateOfPublication": "May 1st 2003",
  "editionLanguage": "hindi",
  "price": 850,
  "onlineStores": "Amazon,Audible,Indigo,Apple Books,Google Play,IndieBound"
}
