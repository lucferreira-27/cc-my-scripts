const express = require('express')
const app = express()

app.get('/hello', (req, res) => {
  res.send('Hello')
})

app.listen(process.env.PORT || 3000, () => {
  console.log('Server listening on port 3000')
})