const path = require('path')
const env = process.env.NODE_ENV || 'dev'
const config = require(path.join(__dirname, '../config/config.json'))[env]
const bcrypt = require('bcrypt')
const crypto = require('crypto')

const saltRounds = config.saltRounds

module.exports = {
  hashPassword (password) {
    return bcrypt.hash(password, saltRounds)
  },
  comparePasswords (password, hash) {
    return bcrypt.compare(password, hash)
  },
  async createToken () {
    const token = await crypto.randomBytes(48)
    return token.toString('hex')
  }
}
