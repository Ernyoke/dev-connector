const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route GET api/profile/me
// @desc Get current user's profile
// @access Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        }).populate('user', ['name', 'avatar']);
        if (!profile) {
            return res.status(400).json({
                msg: 'There is no profile for this user'
            });
        }
        return res.json(profile);
    } catch (err) {
        console.error(err);
        return res.status(500).send('Server error');
    }
});

// @route POST api/profile
// @desc Create or update a profile for an user
// @access Private
router.post('/', [
    auth,
    [
        check('status', 'Status is required').not().isEmpty(),
        check('skills', 'Skills is required').not().isEmail()
    ]
], async (req, res) => {
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
        console.log(skills.split(',').map(skill => skill.trim()));
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

    try {
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
    } catch (err) {
        console.error(err);
        return res.status(500).send('Server error');
    }
});

// @route GET api/profile
// @desc Get all profiles 
// @access Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        return res.json(profiles);
    } catch (err) {
        console.error(err);
        return res.status(500).send('Server error');
    }
});

module.exports = router;