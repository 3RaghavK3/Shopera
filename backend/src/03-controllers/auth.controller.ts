import type { Request, Response, NextFunction } from "express";
import * as authservice from "../04-services/auth.service.js";

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
     const result=await authservice.verifyOtp(email,otp);
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
     const result=await authservice.resendOtp(email);
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
  } catch (e) {
    next(e);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
  } catch (e) {
    next(e);
  }
};

export const oauth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
  } catch (e) {
    next(e);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
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
  } catch (e) {
    next(e);
  }
};