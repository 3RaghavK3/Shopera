import * as authrepository from "../05-repository/auth.repository.js"
import AppError from "../utils/AppError.js";
import bcrypt from "bcrypt"

export const signup =async(name:string,email:string,password:string)=>{
     const user=await authrepository.findUserByEmail(email);

     if(user){
        throw new AppError(409,"Email is already registered");
     }

     const hashedpassword=await bcrypt.hash(password,12);
     await authrepository.createUser(email,name,hashedpassword);
    return {
            message: "User registered successfully."

}
}