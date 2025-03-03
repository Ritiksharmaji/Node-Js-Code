const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const dbPath = path.join(__dirname, 'covid19IndiaPortal.db')
const app = express()

app.use(express.json())

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({filename: dbPath, driver: sqlite3.Database})
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(-1)
  }
}
initializeDBAndServer()

// authentication  part-3 ---------------------
// const longer = (request, response, next) => {
//   console.log(request.query)

//   // to run the next function
//   next()
//
// }

const authenticationToken = (request, response, next) => {
  let jwtToken
  const authHeader = request.headers['authorization']
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(' ')[1]
  }
  if (jwtToken === undefined) {
    response.status(401)
    response.send('Invalid JWT Token')
  } else {
    jwt.verify(jwtToken, 'MY_SECRET_TOKEN', async (error, payload) => {
      if (error) {
        response.status(401)
        response.send('Invalid JWT Token')
      } else {
        console.log(payload)
        // to send the payload data to handelar function
        request.username = payload.username
        next()
      }
    })
  }
}

// for given the response in userFrindly way  of districts data-----
console.log('----------')
const convertDbObjectToResponseObjectOfDistrics = dbObject => {
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

// for given the response in userFrindly way  of states data-----

const convertDbObjectToResponseObjectOfStates = dbObject => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  }
}

// response for statistics measures.... api-8

//Get Books API
app.get('/states/', authenticationToken, async (request, response) => {
  const getBooksQuery = `
            SELECT
              *
            FROM
             state;`

  const booksArray = await db.all(getBooksQuery)
  //response.send(booksArray) for sending the response..
  response.send(
    booksArray.map(eachPlayer =>
      convertDbObjectToResponseObjectOfStates(eachPlayer),
    ),
  )
})

//Get  API
app.get('/states/:stateId/', authenticationToken, async (request, response) => {
  const {stateId} = request.params
  const getBookQuery = `SELECT * FROM state WHERE state_id = ${stateId} `
  const book = await db.get(getBookQuery)
  //response.send(book)

  response.send(convertDbObjectToResponseObjectOfStates(book))
})

//User Register API
app.post('/users/', async (request, response) => {
  const {username, name, password, gender, location} = request.body
  const hashedPassword = await bcrypt.hash(request.body.password, 10)
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}'`
  const dbUser = await db.get(selectUserQuery)
  if (dbUser === undefined) {
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
        )`
    await db.run(createUserQuery)
    response.send(`User created successfully`)
  } else {
    response.status(400)
    response.send('User already exists')
  }
})

//API -1 login ------------------------------------------------
//User Login API
app.post('/login/', async (request, response) => {
  const {username, password} = request.body
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}'`
  const dbUser = await db.get(selectUserQuery)
  if (dbUser === undefined) {
    response.status(400)
    response.send('Invalid user')
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password)
    if (isPasswordMatched === true) {
      const payload = {
        username: username,
      }
      const jwtToken = jwt.sign(payload, 'MY_SECRET_TOKEN')
      response.send({jwtToken})
    } else {
      response.status(400)
      response.send('Invalid password')
    }
  }
})

// user- profile API------------------
app.get('/profile/', authenticationToken, async (request, response) => {
  ///
  const {username} = request
  //response.send('user-name:' + username)
  console.log(username)
  const selectProfileQuery = `select * from user where username = '${username}'`

  const userData = await db.get(selectProfileQuery)
  response.send(userData)
})

// api-4 for distics..
app.post('/districts/', authenticationToken, async (request, response) => {
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const insertQueryDistrics = `
  
  insert into district(district_name,state_id,cases,cured,active,deaths) values(

    '${districtName}',${stateId},${cases}, ${cured},${active},${deaths}
  ) 
  `

  const districInfo = await db.run(insertQueryDistrics)
  response.send('District Successfully Added')
  console.log(districInfo)
})

// api-5 for /districts/:districtId/

app.get(
  '/districts/:districtId/',
  authenticationToken,
  async (request, response) => {
    const {districtId} = request.params

    const selectADistrictQuery = `select * from  district where district_id = ${districtId}`

    const disticsDetail = await db.get(selectADistrictQuery)
    //response.send(disticsDetail)
    response.send(convertDbObjectToResponseObjectOfDistrics(disticsDetail))
  },
)

// api-6 to detete `/districts/:districtId/

app.delete(
  '/districts/:districtId/',
  authenticationToken,
  async (request, response) => {
    ////
    const {districtId} = request.params
    const deleteQuery = `delete from district where district_id = ${districtId}`
    await db.run(deleteQuery)
    response.send('District Removed')
  },
)

console.log('hi')
// api - 7 /districts/:districtId/

app.put(
  '/districts/:districtId/',
  authenticationToken,
  async (request, response) => {
    const {districtId} = request.params
    const {districtName, stateId, cases, cured, active, deaths} = request.body

    const UpdateDistrictQuery = `update district set 
          district_name = '${districtName}',
          state_id = ${stateId},
          cases = ${cases},
          cured = ${cured},
          active = ${active},
          deaths = ${deaths}
      where
    district_id = ${districtId}`
    await db.run(UpdateDistrictQuery)
    response.send('District Details Updated')
  },
)

// api-8  /states/:stateId/stats/ for statices..

app.get(
  '/states/:stateId/stats/',
  authenticationToken,
  async (request, response) => {
    const {stateId} = request.params
    const getPlayerQuery = `
    SELECT
      SUM(district.cases) AS totalCases,
      SUM(district.cured) AS totalCured,
      SUM(district.active) AS totalActive,
      SUM(district.deaths) AS totalDeaths
    FROM
      district
      join 
      state 
      on district.state_id = state.state_id
    WHERE
      state.state_id = ${stateId}`

    try {
      const state = await db.get(getPlayerQuery)
      if (state) {
        response.send({
          totalCases: state.totalCases,
          totalCured: state.totalCured,
          totalActive: state.totalActive,
          totalDeaths: state.totalDeaths,
        })
      } else {
        response.status(404).send('state not found')
      }
    } catch (error) {
      console.error(`Error fetching player scores: ${error.message}`)
      response.status(401).send('Invalid JWT Token')
    }
  },
)

console.log('this is third commit')

module.exports = app
