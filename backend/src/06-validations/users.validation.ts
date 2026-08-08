import { z } from "zod";

export const updatePersonalizationSchema = z.object({
  allows_personalization: z.boolean({
    message: "allows_personalization is required",
  }),
});