const dotenv = require('dotenv')
dotenv.config()


const express = require('express')
const app = express()

const cors = require('cors')
app.use(cors())

const connectDB = require('./db/db')
connectDB()

const cookieParser = require('cookie-parser')
app.use(cookieParser())

const pilotRoutes = require('./routes/pilot.routes')
app.use('/pilot', pilotRoutes)







app.get('/', (req, res) => {
  res.send('Hello World!')
})


module.exports = app