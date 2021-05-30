class QuickMongoError extends Error {
    constructor(message: string, name: string | null = null) {
        super();
        Error.captureStackTrace(this, this.constructor);
        this.message = message;
        this.name = name ?? 'TypeError';
    }
}

export default QuickMongoError;
