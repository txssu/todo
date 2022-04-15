'use strict'
const express = require('express')
const router = express.Router()

const appCrud = require('../app/crud')

/**
 *  @openapi
 *  components:
 *    schemas:
 *      LoginData:
 *        type: object
 *        properties:
 *          username:
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
 *  /session:
 *    post:
 *      description: Create new token
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                user:
 *                  $ref: '#/components/schemas/LoginData'
 *      responses:
 *        200:
 *          description: Set token
 *          headers:
 *            Set-Cookie:
 *              description: Authorizes on behalf of the owner of the token
 *              schema:
 *                type: string
 *        403:
 *          description: Wrong username or password
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 *        422:
 *          description: Wrong login format
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 */
router.post('/', async function (req, res) {
  const { username, password } = req.body.user

  if (typeof username === 'undefined') {
    res.status(422).send({ msg: 'Username required' })
    return
  }
  if (typeof password === 'undefined') {
    res.status(422).send({ msg: 'Password required' })
    return
  }

  const user = await appCrud.getUserByUsernameAndPassword(username, password)
  if (typeof user !== 'undefined') {
    const token = await appCrud.createNewToken(user.id)
    res.cookie('usertoken', token.token, {
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: true
    })
    res.send()
  } else {
    res.status(403).send({ msg: 'Wrong username or password' })
  }
})

/**
 *  @openapi
 *  /session:
 *    delete:
 *      description: Delete current token
 *      responses:
 *        200:
 *          description: Token deleted or nothing changed
 *        500:
 *          $ref: '#/components/responses/ServerError'
 */
router.delete('/', async function (req, res) {
  const token = req.cookies.usertoken
  appCrud.deleteToken(token)
  res.send()
})

/**
 *  @openapi
 *  /session/others:
 *    delete:
 *      description: Delete all tokens except the current
 *      responses:
 *        200:
 *          description: Tokens deleted ot nothing changed
 *        403:
 *          description: Unknown token
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 *        500:
 *          $ref: '#/components/responses/ServerError'
 */
router.delete('/others', async function (req, res) {
  const token = req.cookies.usertoken
  const user = await appCrud.getUserByToken(token)
  if (typeof user !== 'undefined') {
    appCrud.deleteOtherTokens(user, token)
    res.send()
  } else {
    res.status(403).send({ msg: 'Unknown token' })
  }
})

module.exports = router
