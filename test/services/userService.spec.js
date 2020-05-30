const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

const userService = require('../../src/services/userService');

const User = require('../../src/models/User');

describe('#UserService', function () {
    let UserMock;
    let gravatarMock;
    let bcryptMock;

    const sandbox = sinon.createSandbox();

    const user = {
        email: 'email@test.com',
        id: 'userID',
        name: 'Name',
        select: () => user,
        save: () => { }
    };

    beforeEach(function () {
        UserMock = sinon.mock(User);
        gravatarMock = sinon.mock(gravatar);
        bcryptMock = sinon.mock(bcrypt);

        sandbox.spy(user);
    });

    afterEach(function () {
        UserMock.restore();
        gravatarMock.restore();
        bcryptMock.restore();

        sandbox.restore();
    });

    it('should throw in case of already existing user', async function () {
        const name = 'Name';
        const email = 'email@test.com';
        const password = 'password';
        UserMock.expects('findOne').withArgs({ email }).returns(user).once();
        try {
            await userService.createUser(name, email, password);
            expect.fail();
        } catch (e) {
            expect(e.message).to.be.equal(`User with email ${email} already exists!`);
        }
        UserMock.verify();
    });

    it('should create a new user', async function () {
        const name = 'Name';
        const email = 'email@test.com';
        const password = 'password';
        const salt = 'salt';
        const saltedPassword = 'saltedPassword';
        UserMock.expects('findOne').withArgs({ email }).returns(null).once();
        gravatarMock.expects('url').withArgs(email, sinon.match.any).returns('http://url.com').once();
        bcryptMock.expects('getSalt').withArgs(sinon.match.any).returns(salt).once();
        bcryptMock.expects('hash').withArgs(password, salt).returns(saltedPassword).once();
        sinon.stub(User.prototype, 'save');
        await userService.createUser(name, email, password);
        UserMock.verify();
        gravatarMock.verify();
        bcryptMock.verify();
    });
});