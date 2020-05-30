const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

const createUser = async (name, email, password) => {
    if (await User.findOne({
        email
    })) {
        throw new Error(`User with email ${email} already exists!`);
    }

    const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm'
    });

    const user = new User({
        name, email, avatar
    });

    const salt = await bcrypt.getSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
};

module.exports = {
    createUser
};