const ObjectID = require('mongodb').ObjectID;

module.exports = (id, req) => {
    if (!ObjectID.isValid(id)) {
        throw new Error('Invalid object id!');
    }
    return true;
}