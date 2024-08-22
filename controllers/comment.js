const { PrismaClient } = require('@prisma/client')
const asyncHandler = require("express-async-handler");
var jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

const verifyTokenExist = require('../controllers/jwt').verifyTokenExist

// GET list of all comment for 1 post
exports.comment_list = asyncHandler(async (req, res, next) => {

  let allComments = await prisma.comment.findMany({
    where: { postId: Number(req.params.postId) },
    include: { userObj: true },
    orderBy: { timestamp: 'desc' }
  })

  // remove sensitive password, and reformat userObj
  allComments = allComments.map(comment => {
    const { password, ...filteredUserObj } = comment.userObj
    comment.user = { ...filteredUserObj }
    delete comment.userObj
    return comment
  })

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

      const user = await prisma.user.findFirst({
        where: { username: authData.user.username }
      });

      let newComment = {
        text: jsonData.text,
        user: user.id,
        postId: Number(req.params.postId),
        timestamp: new Date(),
      }

      await prisma.comment.create({
        data: { ...newComment }
      })

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
        // var user = await User.findOne({ username: authData.user.username });
        var user = await prisma.user.findFirst({
          where: { username: authData.user.username }
        });
        var oriComment = await prisma.comment.findFirst({
          where: { id: Number(req.params.commentId) },
          include: { userObj: true }
        })

        // filter sensitive data
        const { password, ...filteredUserObj } = oriComment.userObj
        oriComment.user = { ...filteredUserObj }
        delete oriComment.userObj

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

      let updatedComment = {
        text: jsonData.text,
        timestamp: new Date(),
        id: Number(req.params.commentId),
      }

      await prisma.comment.update({
        where: { id: Number(req.params.commentId) },
        data: { ...updatedComment }
      });

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
        var user = await prisma.user.findFirst({
          where: { username: authData.user.username }
        });
        var oriComment = await prisma.comment.findFirst({
          where: { id: Number(req.params.commentId) },
          include: { userObj: true }
        })

        const { password, ...filteredUserObj } = oriComment.userObj
        oriComment.user = { ...filteredUserObj }
        delete oriComment.userObj

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

      await prisma.comment.delete({
        where:{id: Number(req.params.commentId)}
      })

      // deleted success
      res.json({
        message: `deleted comment, id : ${req.params.commentId}`,
      })

    })
  })
]
