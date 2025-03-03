const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const databasePath = path.join(__dirname, 'moviesData.db')

const app = express()

app.use(express.json())

let database = null

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

const convertDbObjectToResponseObjectMovie = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

const convertDbObjectToResponseObjectDirector = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

// for the movie

app.get('/movies/', async (request, response) => {
  const getmoviesQuery = `
    SELECT
      *
    FROM
      movie;`
  const moviesArray = await database.all(getmoviesQuery)
  response.send(
    moviesArray.map(eachMovie =>
      convertDbObjectToResponseObjectMovie(eachMovie),
    ),
  )
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getPlayerQuery = `
    SELECT 
      * 
    FROM 
      movie 
    WHERE 
      movie_id = ${movieId};`
  const player = await database.get(getPlayerQuery)
  response.send(convertDbObjectToResponseObjectMovie(player))
})

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const postPlayerQuery = `
  INSERT INTO
    movie (director_id, movie_name, lead_actor)
  VALUES
    (${directorId}, '${movieName}', '${leadActor}');`
  const player = await database.run(postPlayerQuery)
  response.send('Movie Successfully Added')
})

app.put('/movies/:movieId/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const {movieId} = request.params
  const updatePlayerQuery = `
  UPDATE
    movie
  SET
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
  WHERE
    movie_id = ${movieId};`

  await database.run(updatePlayerQuery)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deletePlayerQuery = `
  DELETE FROM
    movie
  WHERE
    movie_id = ${movieId};`
  await database.run(deletePlayerQuery)
  response.send('Movie Removed')
})

// this is for director tables............................

app.get('/directors/', async (request, response) => {
  const getmoviesQuery = `
    SELECT
      *
    FROM
      director;`
  const moviesArray = await database.all(getmoviesQuery)
  response.send(
    moviesArray.map(eachMovie =>
      convertDbObjectToResponseObjectDirector(eachMovie),
    ),
  )
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getmoviesQuery = `
    SELECT
      movie.movie_name
    FROM
    movie
    NATURAL JOIN director
      where movie.director_id = ${directorId};`
  const moviesArray = await database.all(getmoviesQuery)
  response.send(
    moviesArray.map(eachMovie =>
      convertDbObjectToResponseObjectMovie(eachMovie),
    ),
  )
})

// SELECT course.name,
//   instructor.full_name
// FROM course
//   NATURAL JOIN instructor
// WHERE instructor.full_name = "Alex";

module.exports = app
