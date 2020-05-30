const express = require('express');
const router = express.Router();
const { check, validationResult, param } = require('express-validator');

const auth = require('../../middleware/auth');
const postService = require('../../services/postService');
const UnauthorizedActionError = require('../../services/error/UnauthorizedActionError');

const wrap = require('../wrap');
const handleValidationResult = require('../handleValidationResult');
const objectIdValidator = require('../../middleware/objectIdValidator');
const HttpError = require('../../middleware/error/HttpError');

// @route GET api/posts
// @desc Get all posts
// @access Private
router.get('/', auth, wrap(async (req, res) => {
    return res.json(await postService.getPosts());
}));

// @route GET api/posts/:post_id
// @desc Get post by id
// @access Private
router.get('/:post_id',
    [
        auth,
        [
            param('post_id').custom(objectIdValidator)
        ]
    ],
    wrap(async (req, res) => {
        handleValidationResult(validationResult(req));

        try {
            return res.json(await postService.getPostById(req.params.post_id));
        } catch (e) {
            throw new HttpError.builder().statusCode(404).errorMessage(e.message).build();
        }
    }));


// @route POST api/posts
// @desc Create a post
// @access Private
router.post('/',
    [
        auth,
        [
            check('text', 'Text is required').not().isEmpty()
        ]
    ],
    wrap(async (req, res) => {
        handleValidationResult(validationResult(req));

        return res.json(postService.createNewPost(req.user.id, req.body.text));
    }));

// @route DELETE api/posts/:post_id
// @desc Delete post
// @access Private
router.delete('/:post_id',
    [
        auth,
        [
            param('post_id').custom(objectIdValidator)
        ]
    ],
    wrap(async (req, res) => {
        handleValidationResult(validationResult(req));

        try {
            await postService.deletePost(req.params.post_id, req.user.id);

            return res.status(204).json({
                msg: 'Post removed!'
            });
        } catch (e) {
            throw HttpError.builder().statusCode(400).errorMessage(e.message);
        }
    }));

// @route PUT api/posts/like/:post_id
// @desc Like a post
// @access Private
router.put('/like/:post_id',
    [
        auth,
        [
            param('post_id').custom(objectIdValidator)
        ]
    ],
    wrap(async (req, res) => {
        handleValidationResult(validationResult(req));

        try {
            const post = await postService.likePost(req.params.post_id, req.user.id);
            return res.json(post.likes);
        } catch (e) {
            throw HttpError.builder().statusCode(400).errorMessage(e.message).build();
        }
    }));

// @route PUT api/posts/unlike/:post_id
// @desc Remove a like from a post
// @access Private
router.put('/unlike/:post_id',
    [
        auth,
        [
            param('post_id').custom(objectIdValidator)
        ]
    ],
    wrap(async (req, res) => {
        handleValidationResult(validationResult(req));

        try {
            const post = await postService.unlikePost(req.params.post_id, req.user.id);
            return res.json(post.likes);
        } catch (e) {
            throw HttpError.builder().statusCode(400).errorMessage(e.message).build();
        }
    }));

// @route POST api/posts/comment/:post_id
// @desc Comment on a post
// @access Private
router.post('/comment/:pos_id',
    [
        auth,
        [
            check('text', 'Text is required').not().isEmpty()
        ]
    ],
    wrap(async (req, res) => {
        handleValidationResult(validationResult(req));

        try {
            const post = postService.createComment(req.body.text, req.params.post_id, req.user.id);
            return res.json(post.comments);
        } catch (e) {
            throw HttpError.builder().statusCode(400).errorMessage(e.message).build();
        }
    }));

// @route DELETE api/posts/comment/:post_id/:comment_id
// @desc Delete a comment from a post
// @access Private
router.delete('/comment/:post_id/:comment_id',
    [
        auth,
        [
            param('post_id').custom(objectIdValidator),
            param('comment_id').custom(objectIdValidator)
        ]
    ],
    wrap(async (req, res) => {
        handleValidationResult(validationResult(req));

        try {
            const post = postService.deleteComment(req.body.comment_id, req.params.post_id, req.user.id);
            return res.json(post.comments);
        } catch (e) {
            if (e instanceof UnauthorizedActionError) {
                throw HttpError.builder().statusCode(401).errorMessage(e.message).build();
            }
            throw HttpError.builder().statusCode(400).errorMessage(e.message).build();
        }
    }));

module.exports = router;
