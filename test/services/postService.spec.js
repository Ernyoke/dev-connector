const expect = require('chai').expect;
const sinon = require('sinon');

const Post = require('../../src/models/Post');
const User = require('../../src/models/User');

const UserMock = sinon.mock(User);
const PostMock = sinon.mock(Post);

const postService = require('../../src/services/postService');
const wrap = require('../../src/routes/wrap');

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
        likes: [{user: 'otherUser'}],
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
        wrap(await postService.createNewPost('userID', 'Text'));
        UserMock.verify();
        postMock.verify();
    });

    it('should delete an user', async function () {
        PostMock.expects('findById').withArgs('postID').returns(post).once();
        wrap(await postService.deletePost('postID', 'userID'));
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
});
