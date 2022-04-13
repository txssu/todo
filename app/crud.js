const models = require('../models')
const passwords = require('./passwords')

module.exports = {
  async getAllUsers () {
    return models.User.findAll()
  },
  async getUserByID (userId) {
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
  async getUserByToken (token) {
    const tokenObj = await models.Token.findOne({ where: { token } })
    if (tokenObj) return tokenObj.getUser()
    else return undefined
  },
  async createUser ({ username, password, email }) {
    return models.User.create({ username, password, email })
  },
  async updateUsernameAndEmail (userId, { username, email }) {
    return models.User.update(
      { username, email },
      {
        where: {
          id: userId
        }
      }
    )
  },
  async deleteUser (userId) {
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
  },
  async deleteToken (token) {
    return models.Token.destroy({
      where: { token }
    })
  },
  async createTask ({ title, userId }) {
    return models.Task.create({ title, userId })
  },
  async getUsersTasks (userId) {
    return models.Task.findAll({
      where: { userId }
    })
  },
  async getUsersTaskById (user, taskId) {
    return models.Task.findOne({
      where: {
        userId: user.id,
        id: taskId
      }
    })
  },
  async updateTaskData (userId, taskId, { title, isComplete }) {
    return models.Task.update(
      { title, isComplete },
      {
        where: {
          userId: userId,
          id: taskId
        }
      }
    )
  },
  async deleteTask (taskId) {
    return models.Task.destroy({
      where: {
        id: taskId
      }
    })
  }
}
