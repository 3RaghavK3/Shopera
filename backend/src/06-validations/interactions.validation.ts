import { z } from "zod";

export const trackInteractionSchema = z.object({
  product_id: z.number({ message: "product_id is required" }),
  interaction_type: z.enum(["click", "view", "add_to_cart", "purchase"], {
    message: "interaction_type is required",
  }),
  view_time: z.number().optional(),
});

export const getTopSubcategoriesSchema = z.object({
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : undefined)),
});

export const getTopAttributesSchema = z.object({
  subcategoryId: z.string({ message: "subcategoryId is required" }).transform((val) => parseInt(val)),
});

export const getRecommendationsSchema = z.object({
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : undefined)),
});
