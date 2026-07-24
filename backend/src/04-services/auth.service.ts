import * as authrepository from "../05-repository/auth.repository.js"
import AppError from "../utils/AppError.js";
import bcrypt from "bcrypt"
import redis from "../config/redis.js";
import { generateOtp } from "../utils/otp.js";
import resend from "../config/email.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export interface Purpose{
      signup:string,
      forgot:string
}

export const sendOtp =async(email:string,purpose:"signup"|"forgot")=>{
       const subject = (purpose==="signup")?"ShoperaX - Sign Up Verification":"Shoperax - Password Reset";
       const otp=generateOtp();
       await redis.set(`${purpose}:otp:${email}`,otp,{ex:600})
       await resend.emails.send({
         from: "onboarding@resend.dev",
         to: email,
         subject,
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
     const passwordHash=await bcrypt.hash(password,12);
     await redis.set(
      `signup:${email}`,
      {
         name,
         email,
         passwordHash,
      },
      { ex: 600 }
      );
     await sendOtp(email,"signup");
     return {
      message: "OTP sent successfully. Please verify your email."
     };
}

export const verifyOtp=async(email:string,otp:string,purpose:"signup"|"forgot")=>{

   if(purpose==="signup"){
      const details = await redis.get<{
      name: string;
      email: string;
      passwordHash: string;
      }>(`signup:${email}`);


     if(!details){
       throw new AppError(400,"Signup session has expired. Please sign up again.")
     }

     const actualOtp = await redis.get<string | number>(`signup:otp:${email}`);
     if(!actualOtp){
       throw new AppError(400,"OTP has expired.Please request a new OTP")
     }

     if(String(otp) !== String(actualOtp)){
        throw new AppError(400, "Invalid OTP. Please try again.");
     }

     await authrepository.createUser(details.name,details.email,details.passwordHash);
     await redis.del(`signup:otp:${email}`);
     await redis.del(`signup:${email}`);

     return{
      message: "User successfully created."
     }
   }
   else{
     const actualOtp = await redis.get<string | number>(`forgot:otp:${email}`);
     if(!actualOtp){
       throw new AppError(400,"OTP has expired.Please request a new OTP")
     }

     if(String(otp) !== String(actualOtp)){
        throw new AppError(400, "Invalid OTP. Please try again.");
     }

     await redis.set(`forgot:verified:${email}`,true,{ex:600});
     await redis.del(`forgot:otp:${email}`);

      return {
   message: "OTP verified successfully.",
   };
   }

}

export const resendOtp = async (
  email: string,
  purpose:"signup"|"forgot"
) => {
  if (purpose === "signup") {
    const details = await redis.get(`signup:${email}`);

    if (!details) {
      throw new AppError(
        400,
        "Signup session has expired. Please sign up again.",
      );
    }
  } else if (purpose === "forgot") {
    const user = await authrepository.findUserByEmail(email);

    if (!user) {
      throw new AppError(401, "Invalid email or password.");
    }
  }

  await sendOtp(email,purpose);

  return {
    message: "OTP resent successfully.",
  };
};


export const login =async(email:string,password:string)=>{
     const user=await authrepository.findUserByEmail(email);
     if(!user){
         throw new AppError(401,"Invalid email or password");
     }
     const compare=await bcrypt.compare(password,user.password_hash,)

     if(!compare){
         throw new AppError(401,"Invalid email or password");
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

      return {
      token,
      user: {
         userId: user.user_id,
         name: user.name,
         email: user.email,
      },
      };
}

export const resetPassword=async(email:string,newPassword:string,confirmPassword:string)=>{
    const user=await authrepository.findUserByEmail(email);
     if(!user){
         throw new AppError(401,"Invalid email or password");
     }

     const isForgotVerified=await redis.get<boolean>(`forgot:verified:${email}`);
     if (!isForgotVerified) {
      throw new AppError(401, "Please verify your OTP first.");
      }
     if(newPassword!==confirmPassword){
        throw new AppError(401,"Passwords don't match");
     }
     const passwordHash=await bcrypt.hash(newPassword,12);
     await authrepository.setPassword(email,passwordHash);
     await redis.del(`forgot:verified:${email}`);
     return {
        message:"Password reset succesfully"
     }
}

export const forgotPassword=async(email:string)=>{
      const user = await authrepository.findUserByEmail(email);

      if (!user) {
         throw new AppError(401, "Invalid email or password.");
      }
      
      await sendOtp(email,"forgot");
      return {
         message:"Otp sent to your.Please enter the OTP to reset your password"
      }
}