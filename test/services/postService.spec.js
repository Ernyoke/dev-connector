const expect = require('chai').expect;
const sinon = require('sinon');

const Post = require('../../src/models/Post');
const User = require('../../src/models/User');

const UserMock = sinon.mock(User);

const postService = require('../../src/services/postService');
const wrap = require('../../src/routes/wrap');

describe('#PostService', function () {
    const post = {
        text: 'Text',
        name: 'Name',
        avatar: 'Avatar',
        user:'userID'
    };

    const user = {
        email: 'email@test.com',
        id: 'userID',
        name: 'Name',
        avatar: 'Avatar',
        select: () => user
    };

    it ('should save an user', async function () {
        UserMock.expects('findById').withArgs('userID').returns(user).once();
        const postMock =  sinon.mock(Post.prototype).expects('save').returns(post).once();
        wrap(await postService.createNewPost('userID', 'Text'));
        UserMock.verify();
        postMock.verify();
    });
});
