import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import * as crypto from "crypto";

import AppError from "../utils/AppError.js";
import { getToken, findUserById, deleteToken, setToken } from "../05-repository/auth.repository.js";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const accessToken = req.cookies.accessToken;

    const accessPayload = jwt.verify(
      accessToken,
      process.env.JWT_SECRET!,
    ) as {
      userId: number;
      email: string;
    };

    req.user = accessPayload;

    return next();
  } catch {
    try {
      const refreshToken = req.cookies.refreshToken;

      const refreshPayload = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!,
      ) as {
        userId: number;
      };

      const hashedRefreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");
      const isValidSession = await getToken(hashedRefreshToken);

      if (!isValidSession) {
        return next(
          new AppError(401, "User Session has expired. Please log in again."),
        );
      }

      const user = await findUserById(refreshPayload.userId);

      if (!user) {
        return next(new AppError(401, "User not found."));
      }

      // Rotate refresh token
      const newRefreshToken = jwt.sign(
        { userId: refreshPayload.userId },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: "7d" }
      );
      const newHashedRefreshToken = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
      
      await deleteToken(hashedRefreshToken);
      await setToken(refreshPayload.userId, newHashedRefreshToken);

      const newAccessToken = jwt.sign(
        {
          userId: refreshPayload.userId,
          email: user.email,
        },
        process.env.JWT_SECRET!,
        {
          expiresIn: "15m",
        },
      );

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      req.user = {
        userId: refreshPayload.userId,
        email: user.email,
      };

      return next();
    } catch {
      return next(
        new AppError(401, "User Session has expired. Please log in again."),
      );
    }
  }
};