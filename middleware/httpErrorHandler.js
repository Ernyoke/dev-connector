const chalk = require('chalk');
const HttpError = require('./HttpError');

module.exports = (error, req, res, next) => {
    if (error instanceof HttpError) {
        return res.status(error.statusCode).json({
            errors: error.errorMessages
        });
    }

    if (error) {
        console.error(chalk.red(error.stack));
        return res.status(error.statusCode || 500).json({
            errors: [
                 "Internal server error"
            ]
        });
    }
    next();
};