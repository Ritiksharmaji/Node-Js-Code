const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const databasePath = path.join(__dirname, 'covid19India.db')

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

const convertDbObjectTostateObject = dbObject => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  }
}

const convertDbObjectTodistrictObject = dbObject => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  }
}

// const convertDbStatisesObjectToNormal = statisObject => {
//   return {
//     Total_cases: statisObject.total_cases,
//     Total_cured: statisObject.total_cured,
//     Total_active: statisObject.total_active,
//     Total_deaths: statisObject.total_deaths,
//   }
// }

// APIs for states...

app.get('/states/', async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
      state;`
  const playersArray = await database.all(getPlayersQuery)
  response.send(
    playersArray.map(eachPlayer => convertDbObjectTostateObject(eachPlayer)),
  )
})

app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const getPlayerQuery = `
    SELECT 
      * 
    FROM 
      state 
    WHERE 
      state_id = ${stateId};`
  const player = await database.get(getPlayerQuery)
  response.send(convertDbObjectTostateObject(player))
})

// this is for apis-3 for districs
app.post('/districts/', async (request, response) => {
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const postPlayerQuery = `
  INSERT INTO
    district (district_name, state_id, cases,cured,active,deaths)
  VALUES
    ('${districtName}', ${stateId}, ${cases},${cured},${active},${deaths});`
  const player = await database.run(postPlayerQuery)
  response.send('District Successfully Added')
})

// apis-4 for the districs with get method

app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const getPlayerQuery = `
    SELECT 
      * 
    FROM 
      district 
    WHERE 
      district_id = ${districtId};`
  const player = await database.get(getPlayerQuery)
  response.send(convertDbObjectTodistrictObject(player))
})

// api-5 to detete the distices
app.delete('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const deletePlayerQuery = `
  DELETE FROM
    district
  WHERE
    district_id = ${districtId};`
  await database.run(deletePlayerQuery)
  response.send('District Removed')
})

// apis-6 udate a distices by PUT

app.put('/districts/:districtId/', async (request, response) => {
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const {districtId} = request.params
  const updatePlayerQuery = `
  UPDATE
    district
  SET
    district_name = '${districtName}',
    state_id = ${stateId},
    cases = ${cases},
    cured = ${cured},
    active = ${active},
    deaths = ${deaths}
  WHERE
    district_id = ${districtId};`

  await database.run(updatePlayerQuery)
  response.send('District Details Updated')
})

// ### API 7

// #### Path: `/states/:stateId/stats/`

// #### Method: `GET`
// ### Returns the statistics of total cases, cured, active, deaths of a specific state based on state ID

app.get('/states/:stateId/stats/', async (request, response) => {
  const {stateId} = request.params
  const getPlayersQuery = `
    SELECT
      SUM(cases),
      SUM(cured),
      SUM(active),
      SUM(deaths)
    FROM
      district
      where state_id = ${stateId};`
  const stats = await database.get(getPlayersQuery)
  // response.send(
  //   playersArray.map(eachPlayer => convertDbStatisesObjectToNormal(eachPlayer)),
  // )
  // response.send(playersArray)
  console.log(stats)
  response.send({
    totalCases: stats['SUM(cases)'],
    totalCured: stats['SUM(cured)'],
    totalActive: stats['SUM(active)'],
    totalDeaths: stats['SUM(deaths)'],
  })
})

// ### API 8

// #### Path: `/districts/:districtId/details/`

// #### Method: `GET`

app.get('/districts/:districtId/details/', async (request, response) => {
  const {districtId} = request.params
  const getDistrictIdQuery = `
    select state_id from district
    where district_id = ${districtId};
    ` //With this we will get the state_id using district table
  const getDistrictIdQueryResponse = await database.get(getDistrictIdQuery)
  const getStateNameQuery = `
    select state_name as stateName from state
    where state_id = ${getDistrictIdQueryResponse.state_id};
    ` //With this we will get state_name as stateName using the state_id
  const getStateNameQueryResponse = await database.get(getStateNameQuery)
  response.send(getStateNameQueryResponse)
}) //sending the required response

module.exports = app
