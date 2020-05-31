const User = require('../models/User');
const Profile = require('../models/Profile');

const getProfile = async userId => {
    const profile = await Profile.findOne({
        user: userId
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
        throw new Error('Profile not found!');
    }
    return profile;
};

const getProfiles = async () => {
    return await Profile.find().populate('user', ['name', 'avatar']);
};

const createProfile = async (userId, { company, website, location, bio, status, github, skills, youTube, twitter, linkedIn }) => {
    const profileFields = {
        user: userId,
        company,
        website,
        location,
        bio,
        status,
        github,
        skills: skills ? skills.split(',').map(skill => skill.trim()) : [],
        social: {
            youTube,
            twitter,
            linkedIn
        }
    };

    const profile = await Profile.findOne({ user: userId });

    if (profile) {
        return await Profile.findOneAndUpdate({
            user: userId
        }, {
            $set: profileFields
        }, {
            new: true
        });
    } else {
        return await new Profile(profileFields).save();
    }
};

const addProfileExperience = async (userId, { title, company, location, from, to, current, description }) => {
    const experience = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    };

    const profile = await Profile.findOne({
        user: userId
    });

    profile.experience.unshift(experience);
    return await profile.save();
};

const removeUserAndProfile = async userId => {
    const profile = await Profile.findOneAndRemove({
        user: userId
    });

    if (!profile) {
        throw new Error(`User with id ${userId} not found!`);
    }

    await User.findOneAndRemove({
        _id: userId
    });
};

module.exports = {
    getProfile,
    getProfiles,
    createProfile,
    addProfileExperience,
    removeUserAndProfile
};