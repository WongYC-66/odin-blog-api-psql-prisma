var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('home page');
});

/*

get v1/posts/
post v1/posts/

get v1/posts/:postId
put v1/posts/:postId
delete v1/posts/:postId

get v1/posts/:postId/comments
post v1/posts/:postId/comments
put v1/posts/:postId/comments
delete v1/:postId/comments

posts v1/user-sign-in
posts v1/user-sign-up


*/

module.exports = router;
