const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('config');
const chalk = require('chalk');
const { check, validationResult, param } = require('express-validator');

const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const wrap = require('../wrap');
const handleValidationResult = require('../handleValidationResult');

const profileService = require('../../services/profileService');
const HttpError = require('../../middleware/error/HttpError');
const objectIdValidator = require('../../middleware/objectIdValidator');

// @route GET api/profile/me
// @desc Get current user's profile
// @access Private
router.get('/me',
    auth,
    wrap(async (req, res) => {
        try {
            return res.json(await profileService.getProfile(req.user.user_id));
        } catch (e) {
            throw HttpError.builder().statusCode(400).errorMessage(e.message).build();
        }
    }));

// @route POST api/profile
// @desc Create or update a profile for an user
// @access Private
router.post('/',
    [
        auth,
        [
            check('status', 'Status is required').not().isEmpty(),
            check('skills', 'Skills is required').not().isEmail()
        ]
    ], wrap(async (req, res) => {
        handleValidationResult(validationResult(req));

        return res.status(201).json(await profileService.createProfile(req.user.id, req.body));
    }));

// @route GET api/profile
// @desc Get all profiles 
// @access Public
router.get('/',
    wrap(async (req, res) => {
        return res.json(await profileService.getProfiles());
    }));

// @route GET api/profile/user/:user_id
// @desc Get all profile by user id
// @access Public
router.get('/user/:user_id',
    [
        [
            param('user_id').custom(objectIdValidator)
        ]
    ],
    wrap(async (req, res) => {
        handleValidationResult(validationResult(req));

        try {
            return res.json(await profileService.getProfile(req.params.user_id));
        } catch (e) {
            throw HttpError.builder().statusCode(404).errorMessage(e.message).build();
        }
    }));

// @route DELETE api/profile/user/:user_id
// @desc Delete all profile by user id
// @access Private
router.delete('/user/:user_id',
    [
        auth,
        [
            param('user_id').custom(objectIdValidator)
        ]
    ],
    wrap(async (req, res) => {
        handleValidationResult(validationResult(req));
        // @todo: remove user's posts

        // Remove profile
        try {
            await profileService.removeUserAndProfile(req.params.user_id);
        } catch (e) {
            throw HttpError.builder().statusCode(400).errorMessage(e.message).build();
        }
        return res.status(204).json({
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
    handleValidationResult(validationResult(req));

    return res.json(profileService.addProfileExperience(req.user.id, req.body));
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