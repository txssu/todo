'use strict'

module.exports = {
  renderToken (token) {
    return {
      token: token.token,
      userId: token.userId,
      createdAt: token.createdAt
    }
  }
}
