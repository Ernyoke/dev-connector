const chalk = require('chalk');
const HttpError = require('./error/HttpError');

module.exports = (err, req, res, next) => {
    if (err instanceof HttpError) {
        return res.status(err.statusCode).json({
            errors: err.errors
        });
    }

    if (err) {
        console.error(chalk.red(err));
        return res.status(err.statusCode || 500).json({
            errors: [
                 'Internal server error'
            ]
        });
    }
    next();
};
