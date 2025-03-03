const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')

const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'userData.db')

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
app.post('/register/', async (request, response) => {
  const {username, name, password, gender, location} = request.body

  // if (password.length < 5) {
  //   response.status(400)
  //   response.send('Password is too short')
  //   break
  // }

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
    // checking the strong password..
    if (password.length < 5) {
      response.status(400)
      response.send('Password is too short')
      return // Use return to exit the function
    }
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
      //response.send('User created successfully')
      response.send('User created successfully')
    } else {
      response.send('something wrong doing the inserting time..')
    }
  } else {
    //  sms to user already exit.
    response.send('User already exists')
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
    response.send('Invalid user')
  } else {
    // check for password..
    const isPasswordCorrect = await bcrypt.compare(password, dbUser.password)
    if (isPasswordCorrect === true) {
      response.send('Login success!')
    } else {
      response.status(400)
      response.send('Invalid password')
    }
  }
})

// for updating the password..

app.put('/change-password', async (request, response) => {
  const {username, oldPassword, newPassword} = request.body

  const selectUserQuery = `
  SELECT 
    * 
  FROM 
    user 
  WHERE 
    username = '${username}'`

  const dbUser = await db.get(selectUserQuery)
  if (dbUser !== undefined) {
    // checking the password is correct or not
    // check for password..
    const isPasswordCorrect = await bcrypt.compare(oldPassword, dbUser.password)
    if (isPasswordCorrect === true) {
      //response.send('Login success!')
      // checking the strong password..
      if (newPassword.length < 5) {
        response.status(400)
        response.send('Password is too short')
        return // Use return to exit the function
      } else {
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        // updating the password....
        const UpdatePasswordQuery = `update user set password = '${hashedPassword}' where username = '${username}'`

        await db.run(UpdatePasswordQuery)
        response.send('Password updated')
      }
    } else {
      response.status(400)
      response.send('Invalid current password')
    }
  }
})

module.exports = app
