const express = require('express')
const path = require('path')
const app = express()

app.use(express.json()) // this is for post method ..

const { open } = require('sqlite')
const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'goodreads.db')

let db = null

const initializeDBAndServer = async () => {
    try {
        db = await open({
            // beacuse that await open() will return the promise object so we need to store it so we are using db
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

// from here----------------------------------------------------------
//Get Book API
app.get('/books/:bookId/', async (request, response) => {
    //  const {BookId} = request.params it will show error beacuse in request thre is no nay BookId parameter..
    const { bookId } = request.params
    const getBookQuery = `
  SELECT
   *
    FROM
  book
  WHERE book_id = ${bookId};`

    const singleBookDetials = await db.get(getBookQuery)
    response.send(singleBookDetials)
})

// --------- this is for post API ------------------------

app.post('/books/', async (request, response) => {
    // to aceess the request objects
    const bookdetails = request.body
    // doing object destructuring
    // console.log(bookdetails)
    const {
        title,
        authorId,
        rating,
        ratingCount,
        reviewCount,
        description,
        pages,
        dateOfPublication,
        editionLanguage,
        price,
        onlineStores,
    } = bookdetails

    // writing a query to insert datainto database..
    const insertQuesry = `
  
  INSERT INTO
      book (title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
    VALUES
      (
        '${title}',
         ${authorId},
         ${rating},
         ${ratingCount},
         ${reviewCount},
        '${description}',
         ${pages},
        '${dateOfPublication}',
        '${editionLanguage}',
         ${price},
        '${onlineStores}'
      );`

    const insertsingBook = await db.run(insertQuesry)
    // to get the insert book id from the database
    // console.log(insertsingBook) it will display the object
    const BookId = insertsingBook.lastID
    // to send the response to user as objects
    response.send({ bookid: BookId })
    // response.send({bookdetails: insertsingBook})  it will show some error beacuse it did'nt provide the data till now
})

// this is for put method(update book details API)-----------------

app.put('/books/:bookId', async (request, response) => {
    // to get the book id from the request parameter
    const { bookId } = request.params

    // to get the book details from the body
    const bookDetails = request.body

    // destructuring the object
    const {
        title,
        authorId,
        rating,
        ratingCount,
        reviewCount,
        description,
        pages,
        dateOfPublication,
        editionLanguage,
        price,
        onlineStores,
    } = bookDetails

    // writing the sql query

    const updateBookQuery = `
    UPDATE
      book
    SET
      title='${title}',
      author_id=${authorId},
      rating=${rating},
      rating_count=${ratingCount},
      review_count=${reviewCount},
      description='${description}',
      pages=${pages},
      date_of_publication='${dateOfPublication}',
      edition_language='${editionLanguage}',
      price= ${price},
      online_stores='${onlineStores}'
    WHERE
      book_id = ${bookId};`

    await db.run(updateBookQuery)
    response.send('data successfully updated....!')
})

// this is for delete a book details from the databse.............

app.delete('/books/:bookId', async (request, response) => {
    const { bookId } = request.params

    const deleteBookQuery = `
    DELETE FROM
        book
    WHERE
        book_id = ${bookId};`
    // to run this query

    await db.run(deleteBookQuery)

    response.send('Data deleted from database..')
})

// to get the author id

app.get('/authors/:authorId/books', async (request, response) => {
    const { authorId } = request.params

    const getAuthorBooksQuery = `
    SELECT
    *
    FROM
        book
    WHERE
        author_id = ${authorId};`

    const authorBooks = await db.all(getAuthorBooksQuery)
    response.send(authorBooks)
})
