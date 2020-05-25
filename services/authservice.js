const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');

const User = require('../models/User');

const throwInvalidCredential = () => {
    throw {
        errors: [{
            msg: 'Invalid credentials'
        }]
    };
};

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
        throwInvalidCredential();
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throwInvalidCredential();
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
