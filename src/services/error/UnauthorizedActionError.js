module.exports = class UnauthorizedActionError extends Error {
    constructor(errorMessages) {
        super();
        this.errorMessages = `Unauthorized action: ${errorMessages}`;
    }
};
