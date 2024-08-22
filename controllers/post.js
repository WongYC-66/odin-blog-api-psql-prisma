const asyncHandler = require("express-async-handler");
var jwt = require('jsonwebtoken')

const Post = require('../model/post')
const User = require('../model/user')
const Comment = require('../model/comment')

const { verifyTokenExist, extractToken } = require('../controllers/jwt')

// GET list of all posts
exports.posts_lists = asyncHandler(async (req, res, next) => {

  let allPosts = await Post.find()
    .populate("user")
    .select("-password")
    .sort({ timestamp: -1 })
    .exec()

  // if GET request is sent with valid token
  const token = extractToken(req)
  try {
    // if is admin, getting pusblished and un-published
    const authData = jwt.verify(token, process.env.JWT_SECRET_KEY)
    if (!authData.user || !authData.user.username)
      throw Error()

    const user = await User.findOne({ username: authData.user.username });

    // user not found, or not an admin
    if (!user || !user.isAdmin)
      throw Error()

  } catch {
    // if not admin, filter 
    allPosts = allPosts.filter(p => p.isPublished)
  }

  res.json({
    message: 'getting all posts_list',
    allPosts,
  })
})

// POST 1 new post
exports.posts_create_post = [

  verifyTokenExist,

  asyncHandler(async (req, res, next) => {
    jwt.verify(req.token, process.env.JWT_SECRET_KEY, async (err, authData) => {
      if (err) {
        return res.sendStatus(403)  // forbidden
      }

      let jsonData = req.body

      // missing update params
      if (!jsonData.title || !jsonData.contents || jsonData.isPublished === '') {
        return res.json({
          error: "Missing API input params"
        })
      }

      const user = await User.findOne({ username: authData.user.username });
      // not an admin, denied
      if (!user || !user.isAdmin) {
        return res.sendStatus(403)  // forbidden
      }


      let newPost = new Post({
        title: jsonData.title,
        contents: jsonData.contents,
        user: user,
        timestamp: new Date(),
        isPublished: jsonData.isPublished,
      })

      await newPost.save()

      res.json({
        message: 'post created successfully',
        newPost,
      })
    })
  })
]

// Get 1 post detail from postId
exports.posts_read_get = asyncHandler(async (req, res, next) => {

  try {
    var post = await Post.findById(req.params.postId)
      .populate("user")
      .select("-password")
      .exec()
  } catch {
    // postId error or  not found in database
    return res.json({
      error: "postId incorrect or error"
    })
  }

  if (post.isPublished) {
    // read success
    return res.json({
      message: `getting post by id : ${req.params.postId}`,
      post,
    })
  }

  // un-published post, need to verify if is admin
  const token = extractToken(req)
  try {
    const authData = jwt.verify(token, process.env.JWT_SECRET_KEY)
    if (!authData.user && !authData.user.username) {
      throw Error()
    }

    const user = await User.findOne({ username: authData.user.username });

    // user not found or not ad admin
    if (!user || !user.isAdmin)
      throw Error()

    // read success
    return res.json({
      message: `getting post by id : ${req.params.postId}`,
      post,
    })

  } catch {
    // if not admin, filter 
    return res.sendStatus(403)
  }

});

// Update 1 previous post
exports.posts_update_put = [

  verifyTokenExist,

  asyncHandler(async (req, res, next) => {
    jwt.verify(req.token, process.env.JWT_SECRET_KEY, async (err, authData) => {
      if (err) {
        return res.sendStatus(403)  // forbidden
      }

      let jsonData = req.body
      console.log(jsonData)

      // missing update params
      if (!jsonData.title || !jsonData.contents || jsonData.isPublished === '') {
        return res.json({
          error: "Missing API input params"
        })
      }

      const user = await User.findOne({ username: authData.user.username });
      // not an admin, denied
      if (!user.isAdmin) {
        return res.sendStatus(403)  // forbidden
      }

      let updatedPost = new Post({
        title: jsonData.title,
        contents: jsonData.contents,
        user: user,
        timestamp: new Date(),
        isPublished: jsonData.isPublished,
        _id: req.params.postId
      })


      try {
        const result = await Post.findByIdAndUpdate(req.params.postId, updatedPost, {});
        if (!result) {
          // post not found in database
          return res.sendStatus(409)
        }
      } catch {
        return res.json({
          error: "postId incorrect or error"
        })
      }

      // update success
      res.json({
        message: `updated post, id : ${req.params.postId}`,
        updatedPost,
      })

    })
  })
]
// Delete 1 post
exports.posts_delete = [

  verifyTokenExist,

  asyncHandler(async (req, res, next) => {
    jwt.verify(req.token, process.env.JWT_SECRET_KEY, async (err, authData) => {
      if (err) {
        return res.sendStatus(403)  // forbidden
      }

      const user = await User.findOne({ username: authData.user.username });
      // not an admin, denied
      if (!user.isAdmin) {
        return res.sendStatus(403)  // forbidden
      }

      try {
        const result = await Post.findByIdAndDelete(req.params.postId, {});
        if (!result) {
          // post not found in database
          return res.sendStatus(409)
        }

        // then delete all the comments belong to the post
        await Comment.deleteMany({ postId: req.params.postId });

      } catch {
        return res.json({
          error: "postId incorrect or error"
        })
      }

      // deleted success
      res.json({
        message: `deleted post, id : ${req.params.postId}`,
      })

    })
  })
]
