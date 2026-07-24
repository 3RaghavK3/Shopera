import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new AppError(401, "Authentication required."));
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
      email: string;
    };

    req.user = payload;

    next();
  } catch {
    return next(new AppError(401, "Invalid or expired token."));
  }
};