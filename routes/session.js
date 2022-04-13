'use strict'
const express = require('express')
const router = express.Router()

const appCrud = require('../app/crud')

const { renderToken } = require('./renders/token')

const helpers = require('./helpers')

/*
  Create new token
*/
router.post('/', async function (req, res) {
  const { username, password } = req.body.user

  if (typeof password === 'undefined') {
    helpers.sendError(res, 422, { msg: 'Password required' })
    return
  }

  const user = await appCrud.getUserByUsernameAndPassword(username, password)
  if (typeof user !== 'undefined') {
    const token = await appCrud.createNewToken(user.id)
    helpers.sendOk(res, renderToken(token))
  } else {
    helpers.sendError(res, 403, { msg: 'Wrong username or password' })
  }
})

/*
  Delete token
*/
router.delete('/:token', async function (req, res) {
  const { token } = req.params
  appCrud.deleteToken(token)
  helpers.sendOk(res, {})
})

module.exports = router
