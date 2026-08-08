import { Request, Response, NextFunction } from "express";
import * as interactionsService from "../04-services/interactions.service.js";

export const trackInteraction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.userId;
    const { product_id, interaction_type, view_time } = req.body;
    
    await interactionsService.trackInteraction(
      userId,
      product_id,
      interaction_type,
      view_time
    );
    
    res.status(200).json({
      status: "success",
      message: "Interaction tracked successfully.",
    });
  } catch (error) {
    next(error);
  }
};
