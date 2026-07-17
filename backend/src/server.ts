import express, { Application, Request, Response } from 'express';
import dotenv from "dotenv";
import pool from './config/db.js';
import redis from './config/redis.js';
import errorHandler from "./middleware/errorHandler.js"

dotenv.config();

const app: Application = express();
const port: number = Number(process.env.PORT) ||  3000;

const dbcheck = async()=>{
    try{
        await pool.query("SELECT 1");
        console.log("Connected to the database");
        return true;
    }
    catch(e){
        console.error("Connection to the database failed",e);
        return false;
    }

}

const rdcheck=async()=>{
    try{
        await redis.ping();
        console.log("Connected to redis");
        return true;
    }
    catch(e){
        console.error("Connection to the redis failed",e);
        return false;
    }
    
}

async function start(){
    const [db,redis]=await Promise.all([dbcheck(),rdcheck()]);

    if(db && redis){
        app.listen(port,()=>{
            console.log(`Server running on port :${port}`)
        })
    }
    else{
        console.log("Startup Failed..")
        process.exit(1);
    }
}


app.use(errorHandler);
start();


