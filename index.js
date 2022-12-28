require("dotenv").config();
const express = require('express')
const fs = require('fs')
const bodyParser = require('body-parser')
const app = express()

app.use(bodyParser.json()) // parse application/json
app.use(bodyParser.urlencoded({ extended: true })) // parse application/x-www-form-urlencoded

app.get('/farmland/log', (req, res) => {
    fs.readFile('log.txt', 'utf8', (err, data) => {
      if (err) {
        res.send(err)
      } else {
        res.send(data)
      }
    })
  })

const TOKEN = process.env.TOKEN

app.post('/farmland/log', (req, res) => {
  const authHeader = req.get('Authorization')
  if (!authHeader || authHeader !== `Bearer ${TOKEN}`) {
    return res.status(401).send('Unauthorized')
  }
  console.log(req.body)
  const logData = req.body.logData // assume that logData is coming in the request body

  fs.writeFile('log.txt', logData, 'utf8', (err) => {
    if (err) {
      res.send(err)
    } else {
      res.send('Log file created successfully')
    }
  })
})

app.listen(process.env.PORT || 3000, () => {
  console.log('Server listening on port 3000')
})