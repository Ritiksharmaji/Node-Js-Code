const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const databasePath = path.join(__dirname, 'cricketMatchDetails.db')

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

const convertDbObjectToResponseObject_player = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  }
}

const convertDbObjectToResponseObject_match = dbObject => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  }
}

const convertDbObjectToResponseObject_player_match_score = dbObject => {
  return {
    playerMatchId: dbObject.player_match_id,
    matchId: dbObject.match_id,
    playerId: dbObject.player_id,
    fours: dbObject.fours,
    sixes: dbObject.sixes,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
      player_details;`
  const playersArray = await database.all(getPlayersQuery)
  response.send(
    playersArray.map(eachPlayer =>
      convertDbObjectToResponseObject_player(eachPlayer),
    ),
  )
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
    SELECT 
      * 
    FROM 
      player_details 
    WHERE 
      player_id = ${playerId};`
  const player = await database.get(getPlayerQuery)
  response.send(convertDbObjectToResponseObject_player(player))
})

// ### API 3

// #### Path: `/players/:playerId/`

// #### Method: `PUT`

app.put('/players/:playerId/', async (request, response) => {
  const {playerName} = request.body
  const {playerId} = request.params
  const updatePlayerQuery = `
  UPDATE
    player_details
  SET
    player_name = '${playerName}'
  WHERE
    player_id = ${playerId};`

  await database.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

// ### API 4

// #### Path: `/matches/:matchId/`

// #### Method: `GET`
app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const getMatchrQuery = `
    SELECT 
      * 
    FROM 
      match_details 
    WHERE 
      match_id = ${matchId};`
  const match = await database.get(getMatchrQuery)
  response.send(convertDbObjectToResponseObject_match(match))
})

// ### API 5

// #### Path: `/players/:playerId/matches`

// #### Method: `GET`

app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params
  const getPlayersQuery = `
    SELECT
      match_details.match_id,
      match_details.match,
      match_details.year
    FROM
    match_details
    join
      player_match_score
      on match_details.match_id = player_match_score.match_id
      where 
      player_match_score.player_id = ${playerId};`
  const playersArray = await database.all(getPlayersQuery)
  console.log(playersArray)
  response.send(
    playersArray.map(eachPlayer =>
      convertDbObjectToResponseObject_match(eachPlayer),
    ),
  )
})

// ### API 6

// #### Path: `/matches/:matchId/players`

// #### Method: `GET`
app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const getPlayersQuery = `
    SELECT
      player_details.player_id,
      player_details.player_name
    FROM
    player_details
     join 
      player_match_score
      on player_details.player_id = player_match_score.player_id
      where 
      player_match_score.match_id = ${matchId};`
  const playersArray = await database.all(getPlayersQuery)
  response.send(
    playersArray.map(eachPlayer =>
      convertDbObjectToResponseObject_player(eachPlayer),
    ),
  )
})

// ### API 7

// #### Path: `/players/:playerId/playerScores`

// #### Method: `GET`

// app.get('/players/:playerId/playerScores', async (request, response) => {
//   const {playerId} = request.params
//   const getPlayerQuery = `
//     SELECT
//     player_details.player_id,
//     player_details.player_name,
//     player_match_score.SUM(score),
//     player_match_score.SUM(fours),
//     player_match_score.SUM(sixes)
//     FROM
//     player_details
//     join
//       player_match_score
//       on  player_match_score.player_id=player_details.player_id
//     WHERE
//       player_details.player_id = ${playerId};`
//   const player = await database.get(getPlayerQuery)
//   console.log(player)
//   //response.send(convertDbObjectToResponseObject_player_match_score(player))
//   response.send({
//     playerId: player['player_details.player_id'],
//     playerName: player['player_details.player_name'],
//     totalScore: player['player_match_score.sum(score)'],
//     totalFours: player['player_match_score.SUM(fours)'],
//     totalSixes: player['player_match_score.SUM(sixes)'],
//   })
// })

// ### API 7

// #### Path: `/players/:playerId/playerScores`

// #### Method: `GET`

app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
    SELECT
      player_details.player_id,
      player_details.player_name,
      SUM(player_match_score.score) AS totalScore,
      SUM(player_match_score.fours) AS totalFours,
      SUM(player_match_score.sixes) AS totalSixes
    FROM
      player_details
    JOIN
      player_match_score
      ON player_details.player_id = player_match_score.player_id
    WHERE
      player_details.player_id = ${playerId}
    GROUP BY
      player_details.player_id, player_details.player_name;`

  try {
    const player = await database.get(getPlayerQuery)
    if (player) {
      response.send({
        playerId: player.player_id,
        playerName: player.player_name,
        totalScore: player.totalScore,
        totalFours: player.totalFours,
        totalSixes: player.totalSixes,
      })
    } else {
      response.status(404).send('Player not found')
    }
  } catch (error) {
    console.error(`Error fetching player scores: ${error.message}`)
    response.status(500).send('Internal Server Error')
  }
})

module.exports = app
