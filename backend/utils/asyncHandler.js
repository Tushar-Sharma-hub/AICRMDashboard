// This is used for error handling in async functions and avoid writing try-catch blocks in every function
export const asyncHandler = (fn) => (req,res,next) =>
    Promise.resolve(fn(req,res,next)).catch(next); //promise wrap up the request handler and pass the error to the error handling middleware