'use strict'
const express = require('express')
const Sequelize = require('sequelize')

const appCrud = require('../app/crud')

const router = express.Router()
const helpers = require('./helpers')

const { renderUser } = require('../models/renders/user')

/**
 *  @openapi
 *  components:
 *    schemas:
 *      User:
 *        type: object
 *        properties:
 *          id:
 *            type: integer
 *          username:
 *            type: string
 *          email:
 *            type: string
 *      NewUser:
 *        type: object
 *        properties:
 *          username:
 *            required: true
 *            type: string
 *          email:
 *            required: true
 *            type: string
 *          password:
 *            required: true
 *            type: string
 *    parameters:
 *      userId:
 *        name: userId
 *        in: path
 *        required: true
 *        schema:
 *          type: integer
 */

/**
 *  @openapi
 *  /users:
 *    get:
 *      description: Get all users
 *      responses:
 *        200:
 *          description: Returns array of users
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/User'
 *        500:
 *          $ref: '#/components/responses/ServerError'
 */
router.get('/', async function (req, res) {
  const users = await appCrud.getAllUsers()
  res.send(users.map(renderUser))
})

/**
 *  @openapi
 *  /users:
 *    post:
 *      description: Create new user
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                user:
 *                  $ref: '#/components/schemas/NewUser'
 *      responses:
 *        200:
 *          description: Returns created user
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *        422:
 *          description: The data failed to be validated
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 *        500:
 *          $ref: '#/components/responses/ServerError'
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

/**
 *  @openapi
 *  /users/{userId}:
 *    get:
 *      description: Get user info by his id
 *      parameters:
 *        - $ref: '#/components/parameters/userId'
 *      responses:
 *        200:
 *          description: Returns user
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *        404:
 *          description: There is no user with this ID
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 *        500:
 *          $ref: '#/components/responses/ServerError'
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

/**
 *  @openapi
 *  /users/{userId}:
 *    put:
 *      description: Change user email or username
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                user:
 *                  type: object
 *                  properties:
 *                    username:
 *                      type: string
 *                    email:
 *                      type: string
 *      parameters:
 *        - $ref: '#/components/parameters/userId'
 *      responses:
 *        200:
 *          description: User updated or nothing changed
 *        403:
 *          description: You can only edit your profile
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 *        500:
 *          $ref: '#/components/responses/ServerError'
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
    res.send()
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

/**
 *  @openapi
 *  /users/{userId}:
 *    delete:
 *      description: Delete user
 *      parameters:
 *        - $ref: '#/components/parameters/userId'
 *      responses:
 *        200:
 *          description: User deleted ot nothing changed
 *        403:
 *          description: You can only delete your profile
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 *        500:
 *          $ref: '#/components/responses/ServerError'
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
  res.send()
})

module.exports = router
