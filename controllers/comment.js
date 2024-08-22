const asyncHandler = require("express-async-handler");
var jwt = require('jsonwebtoken')

const Comment = require('../model/comment')
const User = require('../model/user')

const verifyTokenExist = require('../controllers/jwt').verifyTokenExist

// GET list of all comment for 1 post
exports.comment_list = asyncHandler(async (req, res, next) => {
  let allComments = await Comment.find({ postId: req.params.postId })
    .populate("user")
    .select("-password")
    .sort({ timestamp: -1 })
    .exec()

  res.json({
    message: `getting all comment for post id : ${req.params.postId}`,
    allComments,
  })
});

// POST 1 new comment to given postId
exports.create_comment_post = [

  verifyTokenExist,

  asyncHandler(async (req, res, next) => {
    jwt.verify(req.token, process.env.JWT_SECRET_KEY, async (err, authData) => {
      if (err) {
        return res.sendStatus(403)  // forbidden
      }

      let jsonData = req.body

      // validate API input params
      if (!jsonData.text) {
        return res.json({
          error: "missing text parameter"
        })
      }

      const user = await User.findOne({ username: authData.user.username });
      let newComment = new Comment({
        text: jsonData.text,
        user: user,
        postId: req.params.postId,
        timestamp: new Date(),
      })

      await newComment.save()

      // succes
      res.json({
        message: 'comment created successfully',
        newComment,
      })
    })
  })
]

// Update 1 previous comment
exports.comment_update_put = [

  verifyTokenExist,

  asyncHandler(async (req, res, next) => {
    jwt.verify(req.token, process.env.JWT_SECRET_KEY, async (err, authData) => {
      if (err) {
        return res.sendStatus(403)  // forbidden
      }

      let jsonData = req.body

      // validate API input params
      if (!jsonData.text) {
        return res.json({
          error: "missing text parameter"
        })
      }

      try {
        var user = await User.findOne({ username: authData.user.username });
        var oriComment = await Comment.findById(req.params.commentId)
          .populate("user")
          .exec();
      } catch {
        return res.json({
          error: "postId incorrect or error"
        })
      }

      // not found in database
      if (!user || !oriComment) {
        return res.json({
          error: "commentId / userId is either incorrect or error"
        })
      }

      // not authorized
      if (!user.isAdmin && oriComment.user.username !== user.username) {
        return res.sendStatus(403)  // forbidden
      }

      let updatedComment = new Comment({
        text: jsonData.text,
        timestamp: new Date(),
        _id: req.params.commentId
      })

      await Comment.findByIdAndUpdate(req.params.commentId, updatedComment, {});

      // update success
      res.json({
        message: `updated comment, id : ${req.params.commentId}`,
        updatedComment,
      })

    })
  })
]
// Get 1 post
exports.comment_delete = [

  verifyTokenExist,

  asyncHandler(async (req, res, next) => {
    jwt.verify(req.token, process.env.JWT_SECRET_KEY, async (err, authData) => {
      if (err) {
        return res.sendStatus(403)  // forbidden
      }

      try {
        var user = await User.findOne({ username: authData.user.username });
        var oriComment = await Comment.findById(req.params.commentId)
          .populate("user")
          .exec();;
      } catch {
        return res.json({
          error: "postId incorrect or error"
        })
      }

      // not found in database
      if (!user || !oriComment) {
        // comment / user not found in database
        return res.sendStatus(409)
      }

      // not authorized
      if (!user.isAdmin && oriComment.user.username !== user.username) {
        return res.sendStatus(403)  // forbidden
      }

      await Comment.findByIdAndDelete(req.params.commentId, {});

      // deleted success
      res.json({
        message: `deleted comment, id : ${req.params.commentId}`,
      })

    })
  })
]
