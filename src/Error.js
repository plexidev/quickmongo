/**
 * @private
 * @ignore
 */
class QuickError extends Error {

    constructor(message, name = null) {
        super();
        Error.captureStackTrace(this, this.constructor);
        this.message = message;
        this.name = name || "Error";
    }

}

module.exports = QuickError;