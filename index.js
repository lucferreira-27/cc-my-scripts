require("dotenv").config();
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const { MongoClient,ObjectID } = require('mongodb');
const { parentPort } = require("worker_threads");

app.use(bodyParser.json()) // parse application/json
app.use(bodyParser.urlencoded({ extended: true })) // parse application/x-www-form-urlencoded

const TOKEN = process.env.TOKEN
const PORT = process.env.PORT | 3000
const uri = process.env.MONGODB
const client = new MongoClient(uri);

const createLogCollection = async (db,collectionName) =>{
  console.log("Creating " + collectionName)
  await db.createCollection(collectionName)
}
const insertLogDocument = async (document,data) =>{
  const result = await logs.insertOne({ data })
  return result.insertId != null
}

const updateLogDocument = async (document,data) =>{
  const targetLog = await document.findOne()
  if (!targetLog) {
    return insertLogDocument(document,data)
  }
  const result = await document.updateOne(
    { _id: ObjectID(targetLog._id) },
    { $set: { data } }
  );
  console.log(result)
  return result.modifiedCount > 0
}

app.get("/",(req,res) =>{
    res.redirect('/farmland/log');
})

app.get('/farmland/log', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db()

    // Find the log data in the 'logs' collection
    const logs = db.collection('logs')
    const logData = await logs.findOne({})
    console.log(logData.data.length)
    res.send("<pre><code>" + logData.data + "</code></pre>")
  } catch (err) {
    res.send(err)
  }
})


app.post('/farmland/log', async (req, res) => {
  const collectionName = "logs"
  const authHeader = req.get('Authorization')
  if (!authHeader || authHeader !== `Bearer ${TOKEN}`) {
    return res.status(401).send('Unauthorized')
  }

  const logData = req.body.logData // assume that logData is coming in the request body

  try {
    // Connect to the MongoDB database
    const db = client.db()
    let listCollections =  await db.listCollections().toArray() 
    let collectionExist = Array.from(listCollections).find(collection => collection.name == collectionName) != null
    if (!collectionExist) {
      await createLogCollection(db,collectionName)
    }
    const logDocument = db.collection(collectionName)
    updateLogDocument(logDocument,logData)
    res.send("Log data updated successfully")
  } catch (err) {
    console.log(err)
    res.send("Error updating log data")
    res.send(err)
  }
})

client.connect(err => {
  if (err) { console.error(err); return false; }
  app.listen(PORT, () => {
    console.log("listening for requests");
  })
});
