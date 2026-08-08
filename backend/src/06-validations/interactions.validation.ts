import { z } from "zod";

export const trackInteractionSchema = z.object({
  product_id: z.number({ message: "product_id is required" }),
  interaction_type: z.enum(["click", "view", "add_to_cart", "purchase"], {
    message: "interaction_type is required",
  }),
  view_time: z.number().optional(),
});
