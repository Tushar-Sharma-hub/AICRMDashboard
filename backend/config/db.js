import mongoose from "mongoose";

export const connectDB = async() =>{
    const uri=process.env.MONGO_URI;
    if(!uri){
        throw new Error("Mongo URI is not defined in environment variables");
    }
    mongoose.set("strictQuery",true); // this will help us to handle the deprecated fields in the application
    const conn = await mongoose.connect(uri,{
        serverSelectionTimeoutMS:10000, 
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
}