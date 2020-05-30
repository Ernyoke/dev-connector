const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const auth = require('../../middleware/auth');
const authService = require('../../services/authService');
const wrap = require('../wrap');
const handleValidationResult = require('../handleValidationResult')
const HttpError = require('../../middleware/error/HttpError');

// @route GET api/auth
// @desc Test route
// @access Public
router.get('/', auth, wrap(async (req, res) => {
    const user = await authService.getUser(req.user.id)
    return res.json(user);
}));

// @route POST api/auth
// @desc Authenticate user & get token
// @access Public
router.post('/',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password required').exists()
    ],
    wrap(async (req, res) => {
        handleValidationResult(validationResult(req));

        const { email, password } = req.body;

        try {
            const token = await authService.authenticate(email, password);
            return res.status(200).json({
                token
            })
        } catch (e) {
            throw HttpError.builder().statusCode(401).errorMessage(e.message).build();
        }
    }));



module.exports = router;
