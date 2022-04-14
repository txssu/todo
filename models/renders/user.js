'use strict'

module.exports = {
  renderUser (user) {
    return {
      id: user.id,
      username: user.username,
      email: user.email
    }
  }
}
