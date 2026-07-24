//This is used for custom error handling in the application
export class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace?.(this, this.constructor);
    }
}