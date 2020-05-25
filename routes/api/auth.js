const express = require('express');
const router = express.Router();
const chalk = require('chalk');
const { check, validationResult } = require('express-validator');

const auth = require('../../middleware/auth');
const authServ = require('../../services/authservice');

console.log("AUTH:" + JSON.stringify(authServ));

// @route GET api/auth
// @desc Test route
// @access Public
router.get('/', auth, async (req, res) => {
    try {
        const user = await authServ.getUser(req.user.id)
        return res.json(user);
    } catch (err) {
        console.err(chalk.red(err));
        return res.status(400).json({
            errors: [{
                msg: 'Internal server error'
            }]
        });
    }
});

// @route POST api/auth
// @desc Authenticate user & get token
// @access Public
router.post('/',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password required').exists()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        try {
            const token = await authServ.authenticate(email, password);
            return res.status(200).json({
                token
            })
        } catch (err) {
            console.error(chalk.red(JSON.stringify(err)));
            return res.status(400).json(err);
        }
    });



module.exports = router;