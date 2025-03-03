const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const databasePath = path.join(__dirname, 'todoApplication.db')

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

const convertDbObjectToResponseObject = dbObject => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
  }
}

const hasPriorityAndStatusProperties = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

const hasPriorityProperty = requestQuery => {
  return requestQuery.priority !== undefined
}

const hasStatusProperty = requestQuery => {
  return requestQuery.status !== undefined
}

app.get('/todos/', async (request, response) => {
  let data = null
  let getTodosQuery = ''
  const {search_q = '', priority, status} = request.query

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`
      break
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`
      break
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`
      break
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`
  }

  data = await database.all(getTodosQuery)
  response.send(data)
})

//API-2
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getPlayerQuery = `
    SELECT 
      * 
    FROM 
      todo 
    WHERE 
      id = ${todoId};`
  const player = await database.get(getPlayerQuery)
  response.send(convertDbObjectToResponseObject(player))
})

//API-3
app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const postPlayerQuery = `
  INSERT INTO
    todo (id,todo,priority,status)
  VALUES
    (${id}, '${todo}', '${priority}','${status}');`
  const player = await database.run(postPlayerQuery)
  response.send('Todo Successfully Added')
})

//API-4
app.put('/todos/:todoId/', async (request, response) => {
  // const {todo, status, priority} = request.body

  const {todoId} = request.params
  const requestBody = request.body
  let updatadColumn = ''

  const smsFunction = () => {
    if (requestBody.status !== undefined) {
      return 'Status'
    } else if (requestBody.priority !== undefined) {
      return 'Priority'
    } else if (requestBody.todo !== undefined) {
      return 'Todo'
    }
    // switch (true) {
    //   case requestBody.status !== undefined:
    //     updatadColumn ="status"
    //     break
    //   case requestBody.priority !== undefined:
    //      updatadColumn ='Priority'
    //     break
    //   case requestBody.todo !== undefined:
    //     updatadColumn = 'Todo'
    //     break
    // }
  }

  const previousTodoQuery = `
  select * from todo 
  where 
  id = ${todoId}`
  const previousTodo = await database.get(previousTodoQuery)

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body

  const updataPlayerQuery = `
  UPDATE
    todo
  SET
    todo = '${todo}',
    priority = '${priority}',
    status = '${status}'
  WHERE
    id = ${todoId};`

  await database.run(updataPlayerQuery)
  response.send(`${smsFunction()} Updated`)
})

//API-5
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deletePlayerQuery = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`
  await database.run(deletePlayerQuery)
  response.send('Todo Deleted')
})
module.exports = app
