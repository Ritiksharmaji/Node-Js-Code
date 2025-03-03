const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()
const dbpath = path.join(__dirname, 'goodreads.db')

//------------step-1: ------------------------------ creating a connect  and initialization-------------------------
// const db = null   it will show error beacuse if we define a variable with const that cant change so we need to use let
let db = null
const initalltionDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })

    // to start the server
    app.listen(3000, () => {
      console.log('server started:')
    })
  } catch (e) {
    console.log(`database error:${e.message}`)
    process.exit(1)
  }
}

initalltionDBAndServer() // calling the fucnction..
// end ------------------------------------------------------

//....................... step-2: getting the booklist from the database..................................

app.get('/books/', async (request, response) => {
  // writing the queary
  const getBooksQuary = `
    select * 
    from book 
    order by 
    book_id;`

  const BookArrays = await db.all(getBooksQuary)
  response.send(BookArrays)
})
