const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const chalk = require('chalk');

const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route GET api/posts
// @desc Get all posts
// @access Private
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({
            date: -1
        });
        return res.json(posts);
    } catch (err) {
        console.error(chalk.red(err));
        return res.status(500).send('Server error!');
    }
});

// @route GET api/posts/:id
// @desc Get post by id
// @access Private
router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                msg: 'Post not found!'
            });
        }
        return res.json(post);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(404).json({
                msg: 'Post not found!'
            });
        }
        console.error(chalk.red(err));
        return res.status(500).send('Server error!');
    }
});


// @route POST api/posts
// @desc Create a post
// @access Private
router.post('/',
    [
        auth,
        [
            check('text', 'Text is required').not()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        try {
            const user = await User.findById(req.user.id).select('-password');
            const newPost = new Post({
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            });

            const post = await newPost.save();

            return res.json(post);
        } catch (err) {
            console.log(chalk.red(err));
            return res.status(500).send('Server error!');
        }

    });

module.exports = router;