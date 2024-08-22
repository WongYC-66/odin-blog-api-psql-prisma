var express = require('express');
var router = express.Router({ mergeParams: true })

const comment_controller = require('../controllers/comment')


/* GET all comments for postId */
router.get('/:postId', comment_controller.comment_list);

/* Post one new comment for postId */
router.post('/:postId', comment_controller.create_comment_post);

/* Update one new comment for postId */
router.put('/:commentId', comment_controller.comment_update_put);

/* Delete one new comment for postId */
router.delete('/:commentId', comment_controller.comment_delete);

/*

get v1/posts/
post v1/posts/

get v1/posts/:postId
put v1/posts/:postId
delete v1/posts/:postId

get v1/comments/:postId/
post v1/comments/:postId/
put v1/comments/:commentId/
delete v1/comments/:commentId/

posts v1/user-sign-in
posts v1/user-sign-up


*/

module.exports = router;
