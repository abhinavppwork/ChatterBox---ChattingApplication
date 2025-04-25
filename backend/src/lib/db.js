import mongoose from "mongoose";
export const connectDB = async() =>{
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`mongodb connected:${conn.connection.host}`)
    }catch(err) {
        console.log("error occured",err.message)
    }
};