const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('config');
const chalk = require('chalk');
const { check, validationResult } = require('express-validator');

const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const wrap = require('../wrap');

// @route GET api/profile/me
// @desc Get current user's profile
// @access Private
router.get('/me', auth, wrap(async (req, res) => {
    const profile = await Profile.findOne({
        user: req.user.id
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
        return res.status(400).json({
            msg: 'There is no profile for this user'
        });
    }
    return res.json(profile);
}));

// @route POST api/profile
// @desc Create or update a profile for an user
// @access Private
router.post('/', [
    auth,
    [
        check('status', 'Status is required').not().isEmpty(),
        check('skills', 'Skills is required').not().isEmail()
    ]
], wrap(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    const { company, website, location, bio, status, githubusername, skills, youtube, twitter, linkedin } = req.body;

    const profileFields = {
        user: req.user.id
    };

    if (company) {
        profileFields.company = company;
    }
    if (website) {
        profileFields.website = website;
    }
    if (location) {
        profileFields.location = location;
    }
    if (bio) {
        profileFields.bio = bio;
    }
    if (status) {
        profileFields.status = status;
    }
    if (githubusername) {
        profileFields.githubusername = githubusername;
    }
    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    profileFields.social = {};
    if (youtube) {
        profileFields.social.youtube = youtube;
    }
    if (twitter) {
        profileFields.social.twitter = twitter;
    }
    if (linkedin) {
        profileFields.social.linkedin = linkedin;
    }

    let profile = await Profile.findOne({ user: req.user.id });
    if (profile) {
        profile = await Profile.findOneAndUpdate({
            user: req.user.id
        }, {
            $set: profileFields
        }, {
            new: true
        });
    } else {
        profile = new Profile(profileFields);
        await profile.save();
    }
    return res.status(201).json(profile);
}));

// @route GET api/profile
// @desc Get all profiles 
// @access Public
router.get('/', wrap(async (req, res) => {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    return res.json(profiles);
}));

// @route GET api/profile/user/:user_id
// @desc Get all profile by user id
// @access Public
router.get('/user/:user_id', wrap(async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.params.user_id
        }).populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(404).json({
                msg: 'There is no profile for this user'
            });
        }

        return res.json(profile);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(404).json({
                msg: 'There is no profile for this user'
            });
        }
        console.error(err);
        return res.status(500).send('Server error');
    }
}));

// @route DELETE api/profile/user/:user_id
// @desc Delete all profile by user id
// @access Private
router.delete('/', auth, wrap(async (req, res) => {
    // @todo: remove user's posts

    // Remove profile
    await Profile.findOneAndRemove({
        user: req.user.id
    });
    await User.findOneAndRemove({
        _id: req.user.id
    });
    return res.json({
        msg: 'User removed!'
    });
}));

// @route PUT api/profile/experience
// @desc Add profile experience
// @access Private
router.put('/experience', [
    auth,
    [
        check('title', 'Title is required').not().isEmpty(),
        check('company', 'Company is required').not().isEmpty(),
        check('from', 'From date is required').not().isEmpty()
    ]
], wrap(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(
            {
                errors: errors.array()
            }
        );
    }

    const {
        title, company, location, from, to, current, description
    } = req.body;

    const newExp = {
        title, company, location, from, to, current, description
    };

    const profile = await Profile.findOne({
        user: req.user.id
    });

    profile.experience.unshift(newExp);
    await profile.save();

    return res.json(profile);

}));

// @route DELETE api/profile/experience/:exp_id
// @desc Delete profile experience 
// @access Private
router.delete('/experience/:exp_id', auth, wrap(async (req, res) => {
    const profile = await Profile.findOne({
        user: req.user.id
    });

    // Get the experience index
    const removeIndex = profile.experience.map(item => item.id).indexOf(req.param.exp_id);
    profile.experience.splice(removeIndex, 1);

    await profile.save();

    return res.status(204).json(profile);
}));

// @route PUT api/profile/education
// @desc Add profile education
// @access Private
router.put('/education', [
    auth,
    [
        check('school', 'School is required').not().isEmpty(),
        check('degree', 'Degree is required').not().isEmpty(),
        check('fieldOfStudy', 'Field of study is required').not().isEmpty(),
        check('from', 'Field of study is required').not().isEmpty()
    ]
], wrap(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(
            {
                errors: errors.array()
            }
        );
    }

    const {
        school, degree, fieldOfStudy, from, to, current, description
    } = req.body;

    const newEducation = {
        school, degree, fieldOfStudy, from, to, current, description
    };

    const profile = await Profile.findOne({
        user: req.user.id
    });

    console.log(profile);

    profile.education.unshift(newEducation);
    await profile.save();

    return res.json(profile);
}));

// @route DELETE api/profile/education/:edu_id
// @desc Delete profile education
// @access Private
router.delete('/education/:edu_id', auth, wrap(async (req, res) => {
    const profile = await Profile.findOne({
        user: req.user.id
    });

    // Get the experience index
    const removeIndex = profile.experience.map(item => item.id).indexOf(req.param.exp_id);
    profile.experience.splice(removeIndex, 1);

    await profile.save();

    return res.status(204).json(profile);
}));

// @route GET api/profile/github/:username
// @desc Get user repos from Github
// @access Public
router.get('/github/:username', (req, res) => {
    const options = {
        uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=creted:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
        method: 'GET',
        headers: {
            'user-agent': 'node.js'
        }
    };

    request(options, (error, response, body) => {
        if (error) {
            console.log(chalk.red(error));
        }

        if (response.statusCode !== 200) {
            return res.status(404).json({
                msg: 'No Github profile found!'
            });
        }

        return res.json(JSON.parse(body));
    });
});

module.exports = router;