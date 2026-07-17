import express, { Application, Request, Response } from 'express';
import dotenv from "dotenv";
import client from './config/db';

dotenv.config();

const app: Application = express();
const port: number = Number(process.env.PORT) ||  3000;

client.connect()
    .then(()=>{
        console.log("Connected to the database");

        app.listen(port, ()=>{
            console.log(`Server is running on ${port}`)
        });
})
    .catch((e)=>{
        console.error(e);
    });
