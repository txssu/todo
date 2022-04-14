'use strict'

module.exports = {
  sendServerError (res) {
    res.status(500).send({ msg: 'Something unexpected happened' })
  }
}
