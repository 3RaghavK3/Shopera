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

export const getTopSubcategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.userId;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    
    const subcategories = await interactionsService.getTopSubcategories(userId, limit);
    
    res.status(200).json({
      status: "success",
      data: subcategories,
    });
  } catch (error) {
    next(error);
  }
};

export const getTopAttributes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.userId;
    const subcategoryId = parseInt(req.params.subcategoryId as string);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    
    const attributes = await interactionsService.getTopAttributes(userId, subcategoryId, limit);
    
    res.status(200).json({
      status: "success",
      data: attributes,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecommendations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.userId;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 12;
    
    const recommendations = await interactionsService.getRecommendations(userId, limit);
    
    res.status(200).json({
      status: "success",
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};
