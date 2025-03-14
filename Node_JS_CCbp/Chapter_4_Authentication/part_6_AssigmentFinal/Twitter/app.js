const express = require('express')
const {open} = require('sqlite')
const path = require('path')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
//const format = require("date-fns/format");
let database
const app = express()
app.use(express.json())

const initializeDBandServer = async () => {
  try {
    database = await open({
      filename: path.join(__dirname, 'twitterClone.db'),
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running on http://localhost:3000/')
    })
  } catch (error) {
    console.log(`Database error is ${error.message}`)
    process.exit(1)
  }
}

initializeDBandServer()

//api 1

app.post('/register/', async (request, response) => {
  const {username, password, name, gender} = request.body
  const checkUser = `SELECT username FROM user WHERE username='${username}';`
  const dbUser = await database.get(checkUser)
  console.log(dbUser)
  if (dbUser !== undefined) {
    response.status(400)
    response.send('User already exists')
  } else {
    if (password.length < 6) {
      response.status(400)
      response.send('Password is too short')
    } else {
      const hashedPassword = await bcrypt.hash(password, 10)
      const requestQuery = `INSERT INTO user(name, username, password, gender) VALUES(
          '${name}','${username}','${hashedPassword}','${gender}');`
      await database.run(requestQuery)
      response.status(200)
      response.send('User created successfully')
    }
  }
})

//api2
app.post('/login/', async (request, response) => {
  const {username, password} = request.body
  const checkUser = `SELECT * FROM user WHERE username='${username}';`
  const dbUserExist = await database.get(checkUser)
  if (dbUserExist !== undefined) {
    const checkPassword = await bcrypt.compare(password, dbUserExist.password)
    if (checkPassword === true) {
      const payload = {username: username}
      const jwtToken = jwt.sign(payload, 'secret_key')
      response.send({jwtToken})
    } else {
      response.status(400)
      response.send('Invalid password')
    }
  } else {
    response.status(400)
    response.send('Invalid user')
  }
})

//authentication jwt token

const authenticationToken = (request, response, next) => {
  let jwtToken
  const authHeader = request.headers['authorization']
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(' ')[1]
  } else {
    response.status(401)
    response.send('Invalid JWT Token')
  }

  if (jwtToken !== undefined) {
    jwt.verify(jwtToken, 'secret_key', async (error, payload) => {
      if (error) {
        response.status(401)
        response.send('Invalid JWT Token')
      } else {
        request.username = payload.username
        next()
      }
    })
  }
}

//api 3

app.get(
  '/user/tweets/feed/',
  authenticationToken,
  async (request, response) => {
    /** get user id from username  */
    let {username} = request
    const getUserIdQuery = `SELECT user_id FROM user WHERE username='${username}';`
    const getUserId = await database.get(getUserIdQuery)
    //console.log(getUserId);
    /** get followers ids from user id  */
    const getFollowerIdsQuery = `SELECT following_user_id FROM follower 
    WHERE follower_user_id=${getUserId.user_id};`
    const getFollowerIds = await database.all(getFollowerIdsQuery)
    // console.log(getFollowerIds);
    //get follower ids array
    const getFollowerIdsSimple = getFollowerIds.map(eachUser => {
      return eachUser.following_user_id
    })
    // console.log(getUserIds);
    // console.log(`${getUserIds}`);
    //query
    const getTweetQuery = `SELECT user.username, tweet.tweet, tweet.date_time AS dateTime 
      FROM user INNER JOIN tweet 
      ON user.user_id= tweet.user_id WHERE user.user_id IN (${getFollowerIdsSimple})
       ORDER BY tweet.date_time DESC LIMIT 4 ;`
    const responseResult = await database.all(getTweetQuery)
    //console.log(responseResult);
    response.send(responseResult)
  },
)

//api4

app.get('/user/following/', authenticationToken, async (request, response) => {
  let {username} = request
  const getUserIdQuery = `SELECT user_id FROM user WHERE username='${username}';`
  const getUserId = await database.get(getUserIdQuery)
  // console.log(getUserId);
  const getFollowerIdsQuery = `SELECT following_user_id FROM follower 
    WHERE follower_user_id=${getUserId.user_id};`
  const getFollowerIdsArray = await database.all(getFollowerIdsQuery)
  //console.log(getFollowerIdsArray);
  const getFollowerIds = getFollowerIdsArray.map(eachUser => {
    return eachUser.following_user_id
  })
  //console.log(`${getFollowerIds}`);
  const getFollowersResultQuery = `SELECT name FROM user WHERE user_id IN (${getFollowerIds});`
  const responseResult = await database.all(getFollowersResultQuery)
  //console.log(responseResult);
  response.send(responseResult)
})

//api5

app.get('/user/followers/', authenticationToken, async (request, response) => {
  let {username} = request
  const getUserIdQuery = `SELECT user_id FROM user WHERE username='${username}';`
  const getUserId = await database.get(getUserIdQuery)
  //console.log(getUserId);
  const getFollowerIdsQuery = `SELECT follower_user_id FROM follower WHERE following_user_id=${getUserId.user_id};`
  const getFollowerIdsArray = await database.all(getFollowerIdsQuery)
  console.log(getFollowerIdsArray)
  const getFollowerIds = getFollowerIdsArray.map(eachUser => {
    return eachUser.follower_user_id
  })
  console.log(`${getFollowerIds}`)
  //get tweet id of user following x made
  const getFollowersNameQuery = `SELECT name FROM user WHERE user_id IN (${getFollowerIds});`
  const getFollowersName = await database.all(getFollowersNameQuery)
  //console.log(getFollowersName);
  response.send(getFollowersName)
})

//api 6
const api6Output = (tweetData, likesCount, replyCount) => {
  return {
    tweet: tweetData.tweet,
    likes: likesCount.likes,
    replies: replyCount.replies,
    dateTime: tweetData.date_time,
  }
}

app.get('/tweets/:tweetId/', authenticationToken, async (request, response) => {
  const {tweetId} = request.params
  //console.log(tweetId);
  let {username} = request
  const getUserIdQuery = `SELECT user_id FROM user WHERE username='${username}';`
  const getUserId = await database.get(getUserIdQuery)
  // console.log(getUserId);
  //get the ids of whom the use is following
  const getFollowingIdsQuery = `SELECT following_user_id FROM follower WHERE follower_user_id=${getUserId.user_id};`
  const getFollowingIdsArray = await database.all(getFollowingIdsQuery)
  //console.log(getFollowingIdsArray);
  const getFollowingIds = getFollowingIdsArray.map(eachFollower => {
    return eachFollower.following_user_id
  })
  //console.log(getFollowingIds);
  //get the tweets made by the users he is following
  const getTweetIdsQuery = `SELECT tweet_id FROM tweet WHERE user_id IN (${getFollowingIds});`
  const getTweetIdsArray = await database.all(getTweetIdsQuery)
  const followingTweetIds = getTweetIdsArray.map(eachId => {
    return eachId.tweet_id
  })
  // console.log(followingTweetIds);
  //console.log(followingTweetIds.includes(parseInt(tweetId)));
  if (followingTweetIds.includes(parseInt(tweetId))) {
    const likes_count_query = `SELECT COUNT(user_id) AS likes FROM like WHERE tweet_id=${tweetId};`
    const likes_count = await database.get(likes_count_query)
    //console.log(likes_count);
    const reply_count_query = `SELECT COUNT(user_id) AS replies FROM reply WHERE tweet_id=${tweetId};`
    const reply_count = await database.get(reply_count_query)
    // console.log(reply_count);
    const tweet_tweetDateQuery = `SELECT tweet, date_time FROM tweet WHERE tweet_id=${tweetId};`
    const tweet_tweetDate = await database.get(tweet_tweetDateQuery)
    //console.log(tweet_tweetDate);
    response.send(api6Output(tweet_tweetDate, likes_count, reply_count))
  } else {
    response.status(401)
    response.send('Invalid Request')
    console.log('Invalid Request')
  }
})

//api 7
const convertLikedUserNameDBObjectToResponseObject = dbObject => {
  return {
    likes: dbObject,
  }
}

app.get(
  '/tweets/:tweetId/likes/',
  authenticationToken,
  async (request, response) => {
    const {tweetId} = request.params
    //console.log(tweetId);
    let {username} = request
    const getUserIdQuery = `SELECT user_id FROM user WHERE username='${username}';`
    const getUserId = await database.get(getUserIdQuery)
    //console.log(getUserId);
    //get the ids of whom thw use is following
    const getFollowingIdsQuery = `SELECT following_user_id FROM follower WHERE follower_user_id=${getUserId.user_id};`
    const getFollowingIdsArray = await database.all(getFollowingIdsQuery)
    //console.log(getFollowingIdsArray);
    const getFollowingIds = getFollowingIdsArray.map(eachFollower => {
      return eachFollower.following_user_id
    })
    //console.log(getFollowingIds);
    //check is the tweet ( using tweet id) made by his followers
    const getTweetIdsQuery = `SELECT tweet_id FROM tweet WHERE user_id IN (${getFollowingIds});`
    const getTweetIdsArray = await database.all(getTweetIdsQuery)
    const getTweetIds = getTweetIdsArray.map(eachTweet => {
      return eachTweet.tweet_id
    })
    //console.log(getTweetIds);
    //console.log(getTweetIds.includes(parseInt(tweetId)));
    if (getTweetIds.includes(parseInt(tweetId))) {
      const getLikedUsersNameQuery = `SELECT user.username AS likes FROM user INNER JOIN like
       ON user.user_id=like.user_id WHERE like.tweet_id=${tweetId};`
      const getLikedUserNamesArray = await database.all(getLikedUsersNameQuery)
      //console.log(getLikedUserNamesArray);
      const getLikedUserNames = getLikedUserNamesArray.map(eachUser => {
        return eachUser.likes
      })
      // console.log(getLikedUserNames);
      /*console.log(
        convertLikedUserNameDBObjectToResponseObject(getLikedUserNames)
      );*/
      response.send(
        convertLikedUserNameDBObjectToResponseObject(getLikedUserNames),
      )
    } else {
      response.status(401)
      response.send('Invalid Request')
    }
  },
)

//api 8
const convertUserNameReplyedDBObjectToResponseObject = dbObject => {
  return {
    replies: dbObject,
  }
}
app.get(
  '/tweets/:tweetId/replies/',
  authenticationToken,
  async (request, response) => {
    //tweet id of which we need to get reply's
    const {tweetId} = request.params
    console.log(tweetId)
    //user id from user name
    let {username} = request
    const getUserIdQuery = `SELECT user_id FROM user WHERE username='${username}';`
    const getUserId = await database.get(getUserIdQuery)
    // console.log(getUserId);
    //get the ids of whom the user is following
    const getFollowingIdsQuery = `SELECT following_user_id FROM follower WHERE follower_user_id=${getUserId.user_id};`
    const getFollowingIdsArray = await database.all(getFollowingIdsQuery)
    //console.log(getFollowingIdsArray);
    const getFollowingIds = getFollowingIdsArray.map(eachFollower => {
      return eachFollower.following_user_id
    })
    console.log(getFollowingIds)
    //check if the tweet ( using tweet id) made by the person he is  following
    const getTweetIdsQuery = `SELECT tweet_id FROM tweet WHERE user_id IN (${getFollowingIds});`
    const getTweetIdsArray = await database.all(getTweetIdsQuery)
    const getTweetIds = getTweetIdsArray.map(eachTweet => {
      return eachTweet.tweet_id
    })
    console.log(getTweetIds)
    //console.log(getTweetIds.includes(parseInt(tweetId)));
    if (getTweetIds.includes(parseInt(tweetId))) {
      //get reply's
      //const getTweetQuery = `select tweet from tweet where tweet_id=${tweetId};`;
      //const getTweet = await database.get(getTweetQuery);
      //console.log(getTweet);
      const getUsernameReplyTweetsQuery = `SELECT user.name, reply.reply FROM user INNER JOIN reply ON user.user_id=reply.user_id
      where reply.tweet_id=${tweetId};`
      const getUsernameReplyTweets = await database.all(
        getUsernameReplyTweetsQuery,
      )
      //console.log(getUsernameReplyTweets);
      /* console.log(
        convertUserNameReplyedDBObjectToResponseObject(getUsernameReplyTweets)
      );*/

      response.send(
        convertUserNameReplyedDBObjectToResponseObject(getUsernameReplyTweets),
      )
    } else {
      response.status(401)
      response.send('Invalid Request')
    }
  },
)

//api9
//api9
app.get('/user/tweets/', authenticationToken, async (request, response) => {
  try {
    let {username} = request
    const getUserIdQuery = `SELECT user_id FROM user WHERE username='${username}';`
    const getUserId = await database.get(getUserIdQuery)
    if (!getUserId) {
      response.status(404).send('User not found')
      return
    }
    const getUserTweetsQuery = `SELECT * FROM tweet WHERE user_id=${getUserId.user_id};`
    const userTweets = await database.all(getUserTweetsQuery)
    response.send(userTweets)
  } catch (error) {
    console.error('Error fetching user tweets:', error)
    response.status(500).send('Internal Server Error')
  }
})

//api 10

app.post('/user/tweets/', authenticationToken, async (request, response) => {
  let {username} = request
  const getUserIdQuery = `SELECT user_id FROM user WHERE username='${username}';`
  const getUserId = await database.get(getUserIdQuery)
  //console.log(getUserId.user_id);
  const {tweet} = request.body
  //console.log(tweet);
  //const currentDate = format(new Date(), "yyyy-MM-dd HH-mm-ss");
  const currentDate = new Date()
  console.log(currentDate.toISOString().replace('T', ' '))

  const postRequestQuery = `INSERT INTO tweet(tweet, user_id, date_time) VALUES ("${tweet}", ${getUserId.user_id}, '${currentDate}');`

  const responseResult = await database.run(postRequestQuery)
  const tweet_id = responseResult.lastID
  response.send('Created a Tweet')
})

/*
//to check if the tweet got updated
app.get("/tweets/", authenticationToken, async (request, response) => {
  const requestQuery = `select * from tweet;`;
  const responseResult = await database.all(requestQuery);
  response.send(responseResult);
});*/

//deleting the tweet

//api 11
app.delete(
  '/tweets/:tweetId/',
  authenticationToken,
  async (request, response) => {
    const {tweetId} = request.params
    //console.log(tweetId);
    let {username} = request
    const getUserIdQuery = `SELECT user_id FROM user WHERE username='${username}';`
    const getUserId = await database.get(getUserIdQuery)
    //console.log(getUserId.user_id);
    //tweets made by the user
    const getUserTweetsListQuery = `SELECT tweet_id FROM tweet WHERE user_id=${getUserId.user_id};`
    const getUserTweetsListArray = await database.all(getUserTweetsListQuery)
    const getUserTweetsList = getUserTweetsListArray.map(eachTweetId => {
      return eachTweetId.tweet_id
    })
    console.log(getUserTweetsList)
    if (getUserTweetsList.includes(parseInt(tweetId))) {
      const deleteTweetQuery = `DELETE FROM tweet WHERE tweet_id=${tweetId};`
      await database.run(deleteTweetQuery)
      response.send('Tweet Removed')
    } else {
      response.status(401)
      response.send('Invalid Request')
    }
  },
)

module.exports = app
