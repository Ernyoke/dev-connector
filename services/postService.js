const Post = require('../models/Post');
const User = require('../models/User');

const getPosts = async () => {
    return await Post.find().sort({
        date: -1
    });
};

const getPostById = async (id) => {
    return await Post.findById(id);
};

const createNewPost = async (userId, text) => {
    const user = await User.findById(userId).select('-password');
    const newPost = new Post({
        text: text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
    });

    return await newPost.save();
};

module.exports = {
    getPosts,
    getPostById,
    createNewPost
}