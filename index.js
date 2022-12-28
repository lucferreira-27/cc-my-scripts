require("dotenv").config();
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const { MongoClient } = require('mongodb');

app.use(bodyParser.json()) // parse application/json
app.use(bodyParser.urlencoded({ extended: true })) // parse application/x-www-form-urlencoded

const TOKEN = process.env.TOKEN
const PORT = process.env.PORT | 3000
const uri = process.env.MONGODB
const client = new MongoClient(uri);


app.get('/farmland/log', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db()

    // Find the log data in the 'logs' collection
    const logs = db.collection('logs')
    const logData = await logs.findOne({})
    res.send(logData.data)
  } catch (err) {
    res.send(err)
  }
})

app.post('/farmland/log', async (req, res) => {
  const authHeader = req.get('Authorization')
  if (!authHeader || authHeader !== `Bearer ${TOKEN}`) {
    return res.status(401).send('Unauthorized')
  }

  const logData = req.body.logData // assume that logData is coming in the request body
  try {
    // Connect to the MongoDB database
    const db = client.db()
    await db.createCollection('logs')
    console.log(logData)

    // Insert the log data into the 'logs' collection
    const logs = db.collection('logs')
    const result = await logs.insertOne({ data: logData })
    print(result)
    if (result.insertedCount === 1) {
      res.send('Log data inserted successfully')
    } else {
      res.send('Error inserting log data')
    }
  } catch (err) {
    res.send(err)
  }
})

client.connect(err => {
  if(err){ console.error(err); return false;}
  app.listen(PORT, () => {
      console.log("listening for requests");
  })
});
