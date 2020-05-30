const expect = require('chai').expect;
const sinon = require('sinon');

const authService = require('../../src/services/authService');
const User = require('../../src/models/User');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const bcryptMock = sinon.mock(bcrypt);
const jwtMock = sinon.mock(jwt);

const wrap = require('../../src/routes/wrap');

describe('#AuthService', function () {
    const user = {
        email: 'email@test.com',
        password: 'password',
        id: 'userId'
    };

    let userStub;

    beforeEach(function () {
        userStub = sinon.stub(User, 'findOne').returns(user);
    })

    afterEach(function () {
        userStub.restore();
    });

    it('should authenticate an user', async function () {
        const token = 'token';
        const email = 'email@test.com';
        const password = 'password';

        bcryptMock.expects('compare').withArgs(password, user.password).returns(true);
        jwtMock.expects('sign').withArgs({
            user: {
                id: user.id
            }
        }, sinon.match.any).returns(token);
        const authRes = await authService.authenticate(email, password);
        expect(authRes).to.be.equal(token);
    });

    it('should throw in case on invalid credentials', async function () {
        const token = 'token';
        const email = 'email@test.com';
        const password = 'password22';

        bcryptMock.expects('compare').withArgs(password, user.password).returns(false);
        jwtMock.expects('sign').withArgs({
            user: {
                id: user.id
            }
        }, sinon.match.any).returns(token);
        expect(async() => await wrap(authService.authenticate(email, password)).to.throw('Invalid credentials!'));
    });
});
