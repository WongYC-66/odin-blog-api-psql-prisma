const asyncHandler = require("express-async-handler");
const bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken')

const User = require('../model/user')

// Sign in with passport session authentication
exports.sign_in_post = asyncHandler(async (req, res, next) => {

  let jsonData = req.body

  // username check
  let user = await User.findOne({ username: jsonData.username })

  if (!user) {
    return res.json({
      error: "username not found"
    })
  };

  const match = await bcrypt.compare(jsonData.password, user.password);
  // password check 
  if (!match) {
    // passwords do not match!
    return res.json({
      error: "incorrect password"
    })
  }

  user = user.toJSON()  // remove sensitve information e.g password
  // success, send JWToken to client
  jwt.sign({ user }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' }, (err, token) => {
    if (err) {
      return next(err)
    }
    res.json({ token })
  });

});

// Handles User Sign Up Post Request, proceed to register into database
exports.sign_up_post = asyncHandler(async (req, res, next) => {
  // Extract the validation errors from a request.

  let jsonData = req.body

  let user = new User({
    username: jsonData.username,
    password: jsonData.password,
    isAdmin: false
  })

  // upgrade to admin if client provides admin code
  if (jsonData.adminCode === process.env.ADMIN_CODE)
    user.isAdmin = true

  // checking for erros :

  // 1. check if username been used
  let userExisted = await User.findOne({ username: user.username })
    .collation({ locale: "en", strength: 2 })
    .exec()
  if (userExisted) {
    return res.json({
      error: "Username been used"
    })
  }

  // 2. check if password match with confirm password
  if (jsonData.password != jsonData.confirmPassword) {
    return res.json({
      error: "password doesn't match with confirm password"
    })
  }

  // no error, then encrypt user password and save to DB
  bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
    // if err, do something
    if (err) return next(err)
    // otherwise, store hashedPassword in DB
    try {
      user.password = hashedPassword
      await user.save();
      // success, send JWToken to client
      jwt.sign({ user }, process.env.JWT_SECRET_KEY, (err, token) => {
        if (err) {
          return next(err)
        }

        res.json({ 
          message : `success sign up for username : ${user.username}`,
          token
         })
      });
    } catch (err) {
      return next(err);
    }
  })


});


// log out
exports.sign_out_get = asyncHandler(async (req, res, next) => {
  // delete front-end jwt
  res.json("logging out, token deleted")
});
