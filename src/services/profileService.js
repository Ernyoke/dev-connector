const config = require('config');
const chalk = require('chalk');
const axios = require('axios');

const User = require('../models/User');
const Profile = require('../models/Profile');

const getProfile = async userId => {
    const profile = await Profile.findOne({
        user: userId
    });
    if (!profile) {
        throw new Error(`Profile for user ${userId} not found!`);
    }
    return profile;
};

const getProfileWithNameAndAvatar = async userId => {
    const profile = await Profile.findOne({
        user: userId
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
        throw new Error(`Profile ${userId} not found!`);
    }
    return profile;
}

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

    const profile = await getProfile(userId);
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

const addProfileEducation = async (userId, { school, degree, fieldOfStudy, from, to, current, description }) => {
    const education = {
        school,
        degree,
        fieldOfStudy,
        from,
        to,
        current,
        description
    };

    const profile = await getProfile(userId);
    profile.education.unshift(education);

    return await profile.save();
};


const fetchGithubRepositories = async username => {
    try {
        console.log(username);
        const response = await axios.get(`https://api.github.com/users/${username}/repos?per_page=5&sort=creted:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
            {
                headers: {
                    'user-agent': 'node.js'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.log(chalk.red(error.response));
        if (error.response.status !== 200) {
            throw new Error(`No Github profile found for username ${username}!`);
        }
    }
};

module.exports = {
    getProfile,
    getProfileWithNameAndAvatar,
    getProfiles,
    createProfile,
    addProfileExperience,
    removeUserAndProfile,
    addProfileEducation,
    fetchGithubRepositories
};