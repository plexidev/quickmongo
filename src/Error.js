class QuickError extends Error {

    constructor(message, name = null) {
        super();
        Error.captureStackTrace(this, this.constructor);
        this.message = message;
        this.name = name || "QuickMongoError";
    }

}

module.exports = QuickError;