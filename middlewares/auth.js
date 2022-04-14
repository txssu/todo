const appCrud = require('../app/crud')

module.exports = async function (req, res, next) {
  const token = req.cookies.usertoken

  console.log(token)

  if (typeof token !== 'undefined') {
    const user = await appCrud.getUserByToken(token)
    req.user = user
  }

  next()
}
