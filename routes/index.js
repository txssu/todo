'use strict'

const express = require('express')
const router = express.Router()

/**
 *  @openapi
 *  components:
 *    schemas:
 *      Error:
 *        type: object
 *        properties:
 *          msg:
 *            type: string
 *    securitySchemes:
 *      cookieAuth:
 *        name: usertoken
 *        in: cookie
 *        type: apiKey
 *    responses:
 *      ServerError:
 *        description: Something unexpected happened
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 */

/**
 * @openapi
 *  security:
 *    - cookieAuth: []
 */

/* GET home page. */
router.get('/', function (req, res, next) {
  res.send('Hello World!')
})

module.exports = router
