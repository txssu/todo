'use strict'
const express = require('express')
const Sequelize = require('sequelize')

const appCrud = require('../app/crud')

const router = express.Router()
const helpers = require('./helpers')

const { renderUser } = require('../models/renders/user')

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
  res.send(users.map(renderUser))
})

/*
  Create new user with hashing his password
  Required fields: username, password, email
*/
router.post('/', async function (req, res) {
  try {
    const userData = req.body.user
    const user = await appCrud.createUser(userData)
    res.send(renderUser(user))
  } catch (e) {
    if (e instanceof Sequelize.ValidationError) {
      const msg = e.errors.map(x => x.message).join('\n')
      res.status(422).send({ msg })
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
  let { userId } = req.params

  if (userId === '0' && typeof req.user !== 'undefined') {
    userId = req.user.id
  }

  try {
    const user = await appCrud.getUserByID(userId)
    if (user === null) {
      res.status(404).send({ msg: 'User not found' })
    } else {
      res.send(renderUser(user))
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
  let { userId } = req.params

  if (
    typeof req.user === 'undefined' ||
    (userId !== '0' && req.user.id.toString !== userId)
  ) {
    res.status(403).send({ msg: 'You can only edit your profile' })
    return
  }

  userId = req.user.id

  try {
    await appCrud.updateUsernameAndEmail(userId, req.body.user)
    res.send({})
  } catch (e) {
    if (e instanceof Sequelize.ValidationError) {
      const msg = e.errors.map(x => x.message).join('\n')
      res.status(422).send({ msg })
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
  let { userId } = req.params

  if (
    typeof req.user === 'undefined' ||
    (userId !== '0' && req.user.id.toString !== userId)
  ) {
    res.status(403).send({ msg: 'You can only edit your profile' })
    return
  }

  userId = req.user.id

  appCrud.deleteUser(userId)
  res.send({})
})

module.exports = router
