class HttpErrorBuilder {
    _errors = [];

    statusCode(_statusCode) {
        this._statusCode = _statusCode;
        return this;
    }

    errorMessage(_errorMessage) {
        this._errors.push(_errorMessage);
        return this;
    }

    errors(_errors) {
        this._errors = errors;
        return this;
    }

    build() {
        return new HttpError(this._statusCode, this._errors);
    }
}

class HttpError extends Error {
    constructor(statusCode, errors) {
        super();
        this.statusCode = statusCode;
        this.errors = errors;
    }

    static builder() {
        return new HttpErrorBuilder();
    }
}

module.exports = HttpError;