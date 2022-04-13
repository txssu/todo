'use strict'

module.exports = {
  renderUser (user) {
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    }
  }
}
