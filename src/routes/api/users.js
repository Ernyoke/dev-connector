const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const wrap = require('../wrap');
const handleValidationResult = require('../handleValidationResult')

const userService = require('../../services/userService');
const HttpError = require('../../middleware/error/HttpError');


// @route POST api/users
// @desc Register user
// @access Public
router.post('/',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more character').isLength({
            min: 6
        })
    ],
    wrap(async (req, res) => {
        handleValidationResult(validationResult(req))

        try {
            const { name, email, password } = req.body;
            userService.createUser(name, email, password);
            return res.status(201);

        } catch (e) {
            throw new HttpError.builder().statusCode(400).errorMessage(e.message).build();
        }

    }));

module.exports = router;