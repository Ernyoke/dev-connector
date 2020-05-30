const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const ObjectID = require('mongodb').ObjectID;

const auth = require('../../middleware/auth');
const postService = require('../../services/postService');
const UnauthorizedActionError = require('../../services/error/UnauthorizedActionError');

const wrap = require('../wrap');
const HttpError = require('../../middleware/error/HttpError');

// @route GET api/posts
// @desc Get all posts
// @access Private
router.get('/', auth, wrap(async (req, res) => {
    const posts = await postService.getPosts();
    return res.json(posts);
}));

// @route GET api/posts/:id
// @desc Get post by id
// @access Private
router.get('/:id', auth, wrap(async (req, res) => {
    if (!ObjectID.isValid(req.params.id)) {
        return res.status(404).json({
            msg: 'Invalid post id!'
        });
    }

    try {
        const post = await postService.getPostById(req.params.id);
        return res.json(post);
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
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const post = await postService.createNewPost(req.user.id, req.body.text);
        return res.json(post);
    }));

// @route DELETE api/posts/:id
// @desc Delete post
// @access Private
router.delete('/:id', auth, wrap(async (req, res) => {
    if (!ObjectID.isValid(req.params.id)) {
        return res.status(404).json({
            msg: 'Invalid post id!'
        });
    }

    try {
        await postService.deletePost(req.params.id, req.user.id);
    } catch (e) {
        throw HttpError.builder().statusCode(400).errorMessage(e.message);
    }

    return res.status(204).json({
        msg: 'Post removed!'
    });
}));

// @route PUT api/posts/like/:id
// @desc Like a post
// @access Private
router.put('/like/:id', auth, wrap(async (req, res) => {
    if (!ObjectID.isValid(req.params.id)) {
        return res.status(404).json({
            msg: 'Invalid post id!'
        });
    }

    try {
        const post = postService.likePost(req.params.id, req.user.id);
        return res.json(post.likes);
    } catch (e) {
        throw HttpError.builder().statusCode(400).errorMessage(e.message).build();
    }
}));

// @route PUT api/posts/unlike/:id
// @desc Remove a like from a post
// @access Private
router.put('/unlike/:id', auth, wrap(async (req, res) => {
    if (!ObjectID.isValid(req.params.id)) {
        return res.status(404).json({
            msg: 'Invalid post id!'
        });
    }

    try {
        const post = postService.unlikePost(req.params.id, req.user.id);
        return res.json(post.likes);
    } catch (e) {
        throw HttpError.builder().statusCode(400).errorMessage(e.message).build();
    }
}));

// @route POST api/posts/comment/:id
// @desc Comment on a post
// @access Private
router.post('/comment/:id',
    [
        auth,
        [
            check('text', 'Text is required').not().isEmpty()
        ]
    ],
    wrap(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        try {
            const post = postService.createComment(req.body.text, req.params.id, req.user.id);
            return res.json(post.comments);
        } catch (e) {
            throw HttpError.builder().statusCode(400).errorMessage(e.message).build();
        }
    }));

// @route DELETE api/posts/comment/:post_id/:comment_id
// @desc Delete a comment from a post
// @access Private
router.delete('/comment/:post_id/:comment_id', auth, wrap(async (req, res) => {
    try {
        const post = postService.deleteComment(req.body.comment_id, req.params.post_id, req.user.id);
        return res.json(post.comments);
    } catch (e) {
        if (e instanceof UnauthorizedActionError) {
            throw HttpError.builder().statusCode(401).errorMessage(e.message).build();
        }
        throw HttpError.builder().statusCode(400).errorMessage(e.message).build();
    }

    return res.json(post.comments);
}));

module.exports = router;
