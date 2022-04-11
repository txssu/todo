'use strict'
const express = require('express')
const Sequelize = require('sequelize')

const appCrud = require('../app/crud')

const router = express.Router()
const helpers = require('./helpers')

const { renderUser } = require('./renders/user')

/*
  GET / - get all users

  POST / - create new user
    params: {user: {username, email, password}}

  GET /:userId - get user by id

  PUT /:userId - change user username of email
    params: {user: {username, email}}

  DELETE /:userId - delete user
*/

/*
  Get all users from database
*/
router.get('/', async function (req, res) {
  const users = await appCrud.getAllUsers()
  helpers.sendOk(res, users.map(renderUser))
})

/*
  Create new user with hashing his password
  Required fields: username, password, email
*/
router.post('/', async function (req, res) {
  try {
    const userData = req.body.user
    const user = await appCrud.createUser(userData)
    helpers.sendOk(res, renderUser(user))
  } catch (e) {
    if (e instanceof Sequelize.ValidationError) {
      const msg = e.errors.map(x => x.message).join('\n')
      helpers.sendError(res, 422, { msg })
    } else {
      console.log(e)
      helpers.sendServerError(res)
    }
  }
})

/*
  Get user by id
*/
router.get('/:userId', async function (req, res) {
  const { userId } = req.params

  try {
    const user = await appCrud.getUserByID(userId)
    if (user === null) {
      helpers.sendError(res, 422, { msg: 'User not found' })
    } else {
      helpers.sendOk(res, renderUser(user))
    }
  } catch (e) {
    console.log(e)
    helpers.sendServerError(res)
  }
})

/*
  Update user's username and/or email
*/
router.put('/:userId', async function (req, res) {
  const { userId } = req.params
  try {
    await appCrud.updateUsernameAndEmail(userId, req.user?.body)
    helpers.sendOk(res, {})
  } catch (e) {
    if (e instanceof Sequelize.ValidationError) {
      const msg = e.errors.map(x => x.message).join('\n')
      helpers.sendError(res, 422, { msg })
    } else {
      console.log(e)
      helpers.sendServerError(res)
    }
  }
})

/*
  Delete user
*/
router.delete('/:userId', async function (req, res) {
  const { userId } = req.params

  appCrud.deleteUser(userId)
  helpers.sendOk(res, {})
})

module.exports = router
