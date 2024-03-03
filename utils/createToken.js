const jwt = require("jsonwebtoken");

 const createToken = (data) => jwt.sign({ userId: data._id }, process.env.jwt_key, {
        expiresIn: process.env.jwt_expire,
      })
module.exports = createToken
