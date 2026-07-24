import { ApiError } from "../utils/ApiError.js";

//If route is not found, create a new ApiError and pass it to the error handler
export const notFound = (req,res,next) => {
    next(new ApiError(404,`Route not found: ${req.method} ${req.originalUrl}`)) 
};

//This is the global error handler for the application
export const errorHandler = (err,req,res,next) => {

    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal server error";
    //Mongoose : bad ObjectId
    if(err.name === "CastError") {
        const message = `Resource not found. Invalid: ${err.path} : ${err.value}`;
        statusCode = 400;
    }
    //Mongoose : duplicate key error
    if(err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0] || "field";
        message = `A record with that ${field} already exists`;
    }
    //Mongoose Schema validation
    if(err.name==="ValidationError"){
        statusCode=400;
        message=Object.values(err.errors).map((e)=>e.message).join(", ");
    }
    if(process.env.NODE_ENV !== "production" && statusCode===500){
        console.error(err);
    }
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV !== "production" && statusCode===500
            ? {stack:err.stack}
            :{}),
    });
};