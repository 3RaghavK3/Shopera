import type { Request, Response, NextFunction } from "express";
import * as authservice from "../04-services/auth.service.js";
import { clearAuthCookies } from "../utils/clearcookies.js";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password } = req.body;
    const result = await authservice.signUp(name, email, password);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
};

export const verifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
     const {email,otp}=req.body;
     const result=await authservice.verifyOtp(email,otp,"signup");
     res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

export const resendOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
     const {email}=req.body;
     const result=await authservice.resendOtp(email,"signup");
     res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

export const verifyForgotOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
     const {email,otp}=req.body;
     const result=await authservice.verifyOtp(email,otp,"forgot");
     res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

export const resendForgotOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
     const {email}=req.body;
     const result=await authservice.resendOtp(email,"forgot");
     res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {email,password}=req.body;
    const result=await authservice.login(email,password);

    res.cookie("accessToken",result.accessToken,{
      httpOnly:true,
      maxAge:15*60*1000
    })

     res.cookie("refreshToken",result.refreshToken,{
      httpOnly:true,
      maxAge:7*24*60*60*1000
    })

    res.status(200).json(result.user)
;  } catch (e) {
    next(e);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {email}=req.body;
    const result=await authservice.forgotPassword(email);
    res.status(200).json(result)
  } catch (e) {
    next(e);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {email,newPassword,confirmPassword}=req.body;
    const result=await authservice.resetPassword(email,newPassword,confirmPassword);
    res.status(200).json(result);
    
  } catch (e) {
    next(e);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const result=await authservice.logout(refreshToken);
    clearAuthCookies(res);
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};
