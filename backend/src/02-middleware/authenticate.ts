import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";



export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  
  try {
  const accessToken=req.cookies.accessToken;
  const accessPayload = jwt.verify(accessToken, process.env.JWT_SECRET!) as {
  userId: number;
  email: string;
  };

  //if acesstoken there just direct bypass
  next();
  } catch {
    try{
       const refreshToken = req.cookies.refreshToken;
       const refreshPayload = jwt.verify(refreshToken, process.env.REFRESH_SECRET!) as {
          userId: number;
  };

    }
    catch(e){

    }
  }
};
//if access token not there but refreshtoken there using jwt verify whether session is active for the user_id using db check
//if acess not there and refresh also expired tell user to login again
