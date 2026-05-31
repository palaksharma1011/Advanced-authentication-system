const mongoose=require("mongoose");
const config= require('./config.js')

async function connectDB(){
    try{
        await mongoose.connect(config.MONGO_URL);
        console.log("connected to DB");
    }catch(err){
        console.log("error in connecting to DB",err);
    }
}

module.exports = connectDB;