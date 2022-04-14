'use strict'
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const swaggerUi = require('swagger-ui-express')
const swaggerJsdoc = require('swagger-jsdoc')

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'todo',
      version: '1.0.0'
    },
    license: {
      name: 'MIT'
    }
  },
  apis: ['./routes/*.js']
}

const openapiSpecification = swaggerJsdoc(options)

const env = process.env.NODE_ENV || 'dev'

const auth = require('./middlewares/auth')

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const sessionRouter = require('./routes/session')
const tasksRouter = require('./routes/tasks')

const app = express()

if (env !== 'test') app.use(logger('dev'))

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use('/static', express.static(path.join(__dirname, 'public')))
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))
app.use('/openapi', function (req, res) {res.send(openapiSpecification)})

app.use(auth)

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/session', sessionRouter)
app.use('/tasks', tasksRouter)

module.exports = app
