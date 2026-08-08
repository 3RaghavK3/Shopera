import { Request, Response, NextFunction } from "express";
import * as usersService from "../04-services/users.service.js";

export const updatePersonalization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.userId;
    const { allows_personalization } = req.body;

    await usersService.updatePersonalization(userId, allows_personalization);

    res.status(200).json({
      message: "Personalization preference updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const getPersonalization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.userId;
    const allows = await usersService.getPersonalization(userId);
    
    res.status(200).json({
      allows_personalization: allows,
    });
  } catch (error) {
    next(error);
  }
};
