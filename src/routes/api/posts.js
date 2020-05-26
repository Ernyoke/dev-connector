const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const chalk = require('chalk');
const ObjectID = require('mongodb').ObjectID;

const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const postService = require('../../services/postService');

const wrap = require('../wrap');
const HttpError = require('../../middleware/HttpError');

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

    const post = await postService.getPostById(req.params.id);
    if (!post) {
        throw new HttpError(404, 'Post not found!');
    }
    return res.json(post);
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

        const post = await postService.createNewPost(req.user.id, text);
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

    const post = await Post.findById(req.params.id);
    if (!post) {
        return res.status(401).json({
            msg: 'Post not found!'
        });
    }

    //Check user
    if (post.user.toString() !== req.user.id) {
        return res.status(401).json({
            msg: 'User not authorized to delete this post!'
        });
    }

    await post.remove();

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

    const post = await Post.findById(req.params.id);

    if (!post) {
        return res.status(400).json({
            msg: 'Post not found!'
        });
    }

    // Check if the post has already been liked by the user
    if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
        return res.status(400).json({
            msg: 'Post already liked by the user'
        });
    }

    post.likes.unshift({
        user: req.user.id
    });

    await post.save();

    return res.json(post.likes);
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

    const post = await Post.findById(req.params.id);

    if (!post) {
        return res.status(400).json({
            msg: 'Post not found!'
        });
    }

    // Check if the post has already been liked by the user
    if (post.likes.filter(like => like.user.toString() === req.user.id).length <= 0) {
        return res.status(400).json({
            msg: 'Post has not yet been liked by the user!'
        });
    }

    const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);

    await post.save();

    return res.json(post.likes);
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

        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);

        const newComment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        };

        post.comments.unshift(newComment);

        await post.save();

        return res.json(post.comments);
    }));

// @route DELETE api/posts/comment/:id/:comment_id
// @desc Delete a comment from a post
// @access Private
router.delete('/comment/:id/:comment_id', auth, wrap(async (req, res) => {
    const post = await Post.findById(req.params.id);

    // Pull out the comment
    const comment = post.comments.find(comment => comment.id === req.params.comment_id);

    // Make sure comment exists
    if (!comment) {
        return res.status(404).json({
            msg: 'Comment does not exist!'
        });
    }

    // Check user
    if (comment.user.toString() !== req.user.id) {
        return res.status(401).json({
            msg: 'User not authorized to delete this commnent!'
        })
    }

    const removeIndex = post.comments
        .map(comment => comment.user.toString())
        .indexOf(req.user.id);

    post.comments.splice(removeIndex, 1);

    post.save();

    return res.json(post.comments);
}));

module.exports = router;