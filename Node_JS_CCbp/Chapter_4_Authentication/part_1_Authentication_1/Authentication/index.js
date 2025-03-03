const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')

const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'goodreads.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

// Get Books API
app.get('/books/', async (request, response) => {
  const getBooksQuery = `
  SELECT
    *
  FROM
    book
  ORDER BY
    book_id;`
  const booksArray = await db.all(getBooksQuery)
  response.send(booksArray)
})

// this is for authentication part------------
app.post('/users/', async (request, response) => {
  const {username, name, password, gender, location} = request.body

  const hashedPassword = await bcrypt.hash(password, 10)
  const selectUserQuery = `
  SELECT 
    * 
  FROM 
    user 
  WHERE 
    username = '${username}'`

  const dbUser = await db.get(selectUserQuery)

  if (dbUser === undefined) {
    // create a new user

    const createUserQuery = `
  INSERT INTO
    user (username, name, password, gender, location)
  VALUES
    (
      '${username}',
      '${name}',
      '${hashedPassword}',
      '${gender}',
      '${location}'  
    );`

    const dbCreat = await db.run(createUserQuery)
    if (dbCreat !== undefined) {
      response.send('User created successfully !!...')
    } else {
      response.send('something wrong doing the inserting time..')
    }
  } else {
    //  sms to user already exit.
    response.status(400)
    response.send('User Already exit')
  }
})

// authentication  login part ------------

app.post('/login/', async (request, response) => {
  const {username, password} = request.body

  const selectUserQuery = `
  SELECT 
    * 
  FROM 
    user 
  WHERE 
    username = '${username}'`

  const dbUser = await db.get(selectUserQuery)

  if (dbUser === undefined) {
    //invaid username
    response.status(400)
    response.send('username wrong!!...')
  } else {
    // check for password..
    const isPasswordCorrect = await bcrypt.compare(password, dbUser.password)
    if (isPasswordCorrect === true) {
      response.send('Login successfull !!.... yes..')
    } else {
      response.send(400)
      response.send('Password Wrong!..')
    }
  }
})
