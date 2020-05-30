const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');

const User = require('../models/User');

const getSignedToken = payload => {
    return jwt.sign(payload, config.get('jwtSecret'), {
        expiresIn: 3600
    });
};

const authenticate = async (email, password) => {
    let user = await User.findOne({
        email
    });

    if (!user) {
        throw new Error('Invalid credentials!');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid credentials!');
    }

    const payload = {
        user: {
            id: user.id
        }
    };

    return getSignedToken(payload);
};

const getUser = async id => {
    return await User.findById(id).select('-password');
};

module.exports = {
    authenticate, getUser
}
