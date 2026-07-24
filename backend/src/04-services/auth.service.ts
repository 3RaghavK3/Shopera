import * as authrepository from "../05-repository/auth.repository.js"
import AppError from "../utils/AppError.js";
import bcrypt from "bcrypt"
import redis from "../config/redis.js";
import { generateOtp } from "../utils/otp.js";
import resend from "../config/email.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const sendOtp =async(email:string)=>{
       const otp=generateOtp();
       await redis.set(`otp:${email}`,otp,{ex:600})
       await resend.emails.send({
         from: "onboarding@resend.dev",
         to: email,
         subject: "Shopera - Email Verification",
         html: `
            <p>Your OTP for ShoperaX is:</p>
            <h2>${otp}</h2>
            <p>This OTP is valid for 10 minutes.</p>
         `,
      });
   
}

export const signUp =async(name:string,email:string,password:string)=>{
     const user=await authrepository.findUserByEmail(email);

     if(user){
        throw new AppError(409,"Email is already registered");
     }
     const hashedpassword=await bcrypt.hash(password,12);
     await redis.set(
      `signup:${email}`,
      {
         name,
         email,
         passwordHash: hashedpassword,
      },
      { ex: 600 }
      );
     await sendOtp(email);
     return {
      message: "OTP sent successfully. Please verify your email."
     };
}

export const verifyOtp=async(email:string,otp:string)=>{

   const details = await redis.get<{
      name: string;
      email: string;
      passwordHash: string;
      }>(`signup:${email}`);


     if(!details){
       throw new AppError(400,"Signup session has expired. Please sign up again.")
     }

     const actualOtp = await redis.get<string | number>(`otp:${email}`);
     if(!actualOtp){
       throw new AppError(400,"OTP has expired.Please request a new OTP")
     }

     if(String(otp) !== String(actualOtp)){
        throw new AppError(400, "Invalid OTP. Please try again.");
     }

     await authrepository.createUser(details.name,details.email,details.passwordHash);

     await redis.del(`otp:${email}`);
     await redis.del(`signup:${email}`);

     return{
      message: "User successfully created."
     }
}

export const resendOtp=async(email:string)=>{      
     const details = await redis.get(`signup:${email}`);
      if (!details) {
      throw new AppError(
         400,
         "Signup session has expired. Please sign up again."
      );
      }
     await sendOtp(email);
     return {
      message:"Otp resent.Please verify your email"
     }
}

export const login =async(email:string,password:string)=>{
     const user=await authrepository.findUserByEmail(email);
     if(!user){
         throw new AppError(401,"No User Found");
     }
     const compare=await bcrypt.compare(password,user.password_hash,)

     if(!compare){
         throw new AppError(401,"Invalid Password.Please try Again");
     }

     const token = jwt.sign(
      {
         userId: user.user_id,
         email: user.email,
      },
      process.env.JWT_SECRET!,
      {
         expiresIn: "15m",
      }
      );
}