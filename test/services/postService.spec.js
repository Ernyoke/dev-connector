const expect = require('chai').expect;
const sinon = require('sinon');

const Post = require('../../src/models/Post');
const User = require('../../src/models/User');

const UserMock = sinon.mock(User);
const PostMock = sinon.mock(Post);

const postService = require('../../src/services/postService');

describe('#PostService', function () {
    const user = {
        email: 'email@test.com',
        id: 'userID',
        name: 'Name',
        avatar: 'Avatar',
        select: () => user
    };

    const post = {
        text: 'Text',
        name: 'Name',
        avatar: 'Avatar',
        user: 'userID',
        id: 'postID',
        likes: [{ user: 'otherUser' }],
        comments: [{ text: 'text', user: 'userID', id: 'commentID' }],
        remove: () => {
        },
        save: () => post
    };

    const sandbox = sinon.createSandbox();

    beforeEach(function () {
        sandbox.spy(post);
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should save an user', async function () {
        UserMock.expects('findById').withArgs('userID').returns(user).once();
        const postMock = sinon.mock(Post.prototype).expects('save').returns(post).once();
        await postService.createNewPost('userID', 'Text');
        UserMock.verify();
        postMock.verify();
    });

    it('should delete an user', async function () {
        PostMock.expects('findById').withArgs('postID').returns(post).once();
        await postService.deletePost('postID', 'userID');
        expect(post.remove.calledOnce).to.be.true;
        PostMock.verify();
    });

    it('should like a post', async function () {
        const numberOfLikes = post.likes.length;
        PostMock.expects('findById').withArgs('postID').returns(post).once();
        const actualPost = await postService.likePost('postID', 'userID');
        expect(actualPost.likes[0].user).to.be.equal('userID');
        expect(actualPost.likes.length).to.be.equal(numberOfLikes + 1);
        expect(post.save.calledOnce).to.be.true;
    });

    it('should unlike a post', async function () {
        const numberOfLikes = post.likes.length;
        PostMock.expects('findById').withArgs('postID').returns(post).once();
        const actualPost = await postService.unlikePost('postID', 'otherUser');
        expect(actualPost.likes.length).to.be.equal(numberOfLikes - 1);
        expect(post.save.calledOnce).to.be.true;
    });

    it('should create a new comment', async function () {
        const numberOfComments = post.comments.length;
        UserMock.expects('findById').withArgs('userID').returns(user).once();
        PostMock.expects('findById').withArgs('postID').returns(post).once();
        const actualPost = await postService.createComment('commentText', 'postID', 'userID');
        expect(actualPost.comments[0].text).to.be.equal('commentText');
        expect(actualPost.comments.length).to.be.equal(numberOfComments + 1);
        expect(post.save.calledOnce).to.be.true;
    });

    it('should remove an existing comment', async function () {
        const numberOfComments = post.comments.length;
        UserMock.expects('findById').withArgs('userID').returns(user).once();
        PostMock.expects('findById').withArgs('postID').returns(post).once();
        const actualPost = await postService.deleteComment('commentID', 'postID', 'userID');
        expect(actualPost.comments.length).to.be.equal(numberOfComments - 1);
        expect(post.save.calledOnce).to.be.true;
    });

});
