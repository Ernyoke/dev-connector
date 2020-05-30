const HttpError = require('../middleware/error/HttpError');

module.exports = (errors) => {
    if (!errors.isEmpty()) {
        throw HttpError.builder().statusCode(400).errorMessage(errors.array()).build();
    }
};