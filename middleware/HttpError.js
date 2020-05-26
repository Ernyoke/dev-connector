class HttpErrorBuilder {
    statusCode(_statusCode) {
        this._statusCode =  _statusCode;
        return this;
    }

    errorMessage(_errorMessage) {
        this._errorMessage = _errorMessage;
        return this;
    }

    build() {
        return new HttpError(this._statusCode, this._errorMessage);
    }
}

class HttpError extends Error {
    constructor(statusCode, errorMessages) {
        super();
        this.statusCode = statusCode;
        this.errorMessages = errorMessages;
    }

    static builder() {
        return new HttpErrorBuilder();
    }
}

module.exports = HttpError;