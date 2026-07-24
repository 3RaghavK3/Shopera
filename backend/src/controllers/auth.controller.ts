import type { Request, Response ,NextFunction } from "express";
import * as authservice from "../services/auth.service.js"

export const signup = async (req: Request, res: Response ,next:NextFunction) => {
    try{
        const {name,email,password}=req.body;
       const result= await authservice.signup(name,email,password);
       res.status(201).json(result);
    }
    catch(e){
        next(e);
    }
       
};

export const verifyOtp = async (req: Request, res: Response) => {

};

export const resendOtp = async (req: Request, res: Response) => {

};

export const login = async (req: Request, res: Response) => {

};

export const refreshToken = async (req: Request, res: Response) => {

};

export const oauth = async (req: Request, res: Response) => {

};

export const forgotPassword = async (req: Request, res: Response) => {

};

export const verifyForgotOtp = async (req: Request, res: Response) => {

};

export const resendForgotOtp = async (req: Request, res: Response) => {

};

export const resetPassword = async (req: Request, res: Response) => {

};

export const logout = async (req: Request, res: Response) => {

};