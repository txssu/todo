'use strict'

module.exports = {
  sendError (res, statusCode, error) {
    res.status(statusCode)
    res.send({ ok: false, error })
  },
  sendServerError (res) {
    this.sendError(res, 500, { msg: 'Something unexpected happened' })
  },
  sendOk (res, response) {
    res.send({ ok: true, response })
  }
}
