const expect = require('chai').expect;
const sinon = require('sinon');

const User = require('../../src/models/User');
const Profile = require('../../src/models/Profile');

const profileService = require('../../src/services/profileService');

describe('#ProfileService', function () {
    let user, profile;
    let UserMock, ProfileMock;

    const sandbox = sinon.createSandbox();

    beforeEach(function () {
        user = {
            email: 'email@test.com',
            id: 'userID',
            name: 'Name',
            avatar: 'Avatar',
            select: () => user
        };

        profile = {
            user: user,
            skills: [],
            experience: {},
            education: {},
            populate: () => profile
        };

        UserMock = sinon.mock(User);
        ProfileMock = sinon.mock(Profile);

        sandbox.spy(profile);
    });

    afterEach(function () {
        UserMock.restore();
        ProfileMock.restore();
        sandbox.restore();
    });

    it('should get the profile of an user', async function () {
        ProfileMock.expects('findOne').withArgs({
            user: 'userID'
        }).returns(profile).once();
        const actual = await profileService.getProfile('userID');
        expect(actual.user).to.be.equal(user);
        ProfileMock.verify();
    });

    it('should get all the profiles', async function () {
        ProfileMock.expects('find').returns(profile).once();
        const actual = await profileService.getProfiles();
        ProfileMock.verify();
        expect(profile.populate.calledOnce).to.be.true;
    });
});