const Post = require('../models/Post');
const User = require('../models/User');

const UnauthorizedActionError = require('./error/UnauthorizedActionError');

const getPosts = async () => {
    return await Post.find().sort({
        date: -1
    });
};

const getPostById = async (id) => {
    const post = await Post.findById(id);
    if (!post) {
        throw new Error(`Post with id ${id} nod found!`);
    }
    return post;
};

const createNewPost = async (userId, text) => {
    const user = await User.findById(userId).select('-password');
    const newPost = new Post({
        text: text,
        name: user.name,
        avatar: user.avatar,
        user: userId
    });

    return await newPost.save();
};

const deletePost = async (postId, userId) => {
    const post = await getPostById(postId);

    // Only the author of the post should be allowed to delete his posts
    if (post.user.toString() !== userId) {
        throw new UnauthorizedActionError('User not authorized to delete this post!');
    }

    await post.remove();
};

const likePost = async (postId, userId) => {
    const post = await getPostById(postId);

    // Check if the post has already been liked by the user
    if (post.likes.filter(like => like.user.toString() === userId).length > 0) {
        throw Error('Post was already liked by the user!');
    }

    post.likes.unshift({
        user: userId
    });

    return await post.save();
};

const unlikePost = async (postId, userId) => {
    const post = await getPostById(postId);

    // Check if the post has not been liked by the user
    if (post.likes.filter(like => like.user.toString() === userId).length <= 0) {
        throw new Error('Post has not yet been liked by the user!');
    }

    const removeIndex = post.likes.map(like => like.user.toString()).indexOf(userId);
    post.likes.splice(removeIndex, 1);

    return await post.save();
};

const createComment = async (text, postId, userId) => {
    const user = await User.findById(userId).select('-password');
    const post = await getPostById(postId);

    const newComment = {
        text: text,
        name: user.name,
        avatar: user.avatar,
        user: user.id
    };

    post.comments.unshift(newComment);

    return await post.save();
};

const deleteComment = async (commentId, postId, userId) => {
    const post = await getPostById(postId);

    // Pull out the comment
    const comment = post.comments.find(comment => comment.id === commentId);

    // Make sure comment exists
    if (!comment) {
        throw new Error(`Comment with id ${commentId} does not exist!`);
    }

    // Check if the comment was authored bt the user
    if (comment.user.toString() !== userId) {
        throw new UnauthorizedActionError('User not authorized to delete this comment!');
    }

    const removeIndex = post.comments
        .map(comment => comment.user.toString())
        .indexOf(userId);

    post.comments.splice(removeIndex, 1);

    return await post.save();
};

module.exports = {
    getPosts,
    getPostById,
    createNewPost,
    deletePost,
    likePost,
    unlikePost,
    createComment,
    deleteComment
}

