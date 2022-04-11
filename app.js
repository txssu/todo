'use strict'
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

const env = process.env.NODE_ENV || 'dev'

const auth = require('./middlewares/auth')

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const sessionRouter = require('./routes/session')

const app = express()

if (env !== 'test') app.use(logger('dev'))

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use('/static', express.static(path.join(__dirname, 'public')))

app.use(auth)

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/session', sessionRouter)

module.exports = app
