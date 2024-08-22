var express = require('express');
var router = express.Router();

const post_controller = require('../controllers/post')

/* GET all Posts. */
router.get('/', post_controller.posts_lists);

/* POST 1 new post. */
router.post('/', post_controller.posts_create_post);

/* GET one post. */
router.get('/:postId', post_controller.posts_read_get);

/* Update one post. */
router.put('/:postId', post_controller.posts_update_put);

/* GET one post. */
router.delete('/:postId', post_controller.posts_delete);

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
