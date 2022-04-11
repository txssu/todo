const models = require('../models')
const passwords = require('./passwords')

module.exports = {
  getAllUsers () {
    return models.User.findAll()
  },
  getUserByID (userId) {
    return models.User.findByPk(userId)
  },
  async getUserByUsernameAndPassword (username, password) {
    const user = await models.User.findOne({ where: { username } })
    const match = await passwords.comparePasswords(
      password,
      user?.password || ''
    )
    if (match) {
      return user
    } else {
      return undefined
    }
  },
  createUser ({ username, password, email }) {
    return models.User.create({ username, password, email })
  },
  updateUsernameAndEmail (userId, { username, email }) {
    return models.User.update(
      { username, email },
      {
        where: {
          id: userId
        }
      }
    )
  },
  deleteUser (userId) {
    return models.User.destroy({
      where: {
        id: userId
      }
    })
  },
  async createNewToken (userId) {
    const token = await passwords.createToken()
    return models.Token.create({
      userId,
      token
    })
  }
}
