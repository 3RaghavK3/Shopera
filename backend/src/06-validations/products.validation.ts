import { z } from "zod";

export const searchSchema = z.object({
  q: z
    .string({
      error: "Search query 'q' must be a string",
    })
    .trim()
    .toLowerCase()
    .transform((value) =>
      value
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, " ")
    )
    .pipe(
      z.string().min(1, "Search query must contain at least one valid character")
    ),
});

export type ProductSearchQuery = z.infer<typeof searchSchema>;

export const getProductsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(18),
  category_id: z.coerce.number().optional(),
  subcategory_id: z.coerce.number().optional(),
  min_price: z.coerce.number().optional(),
  max_price: z.coerce.number().optional(),
  min_rating: z.coerce.number().min(0).max(5).optional(),
  attributes: z.union([z.string(), z.array(z.string())]).optional(),
}).superRefine((data, ctx) => {
  if (data.subcategory_id !== undefined && data.category_id === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "category_id must be provided when filtering by subcategory_id",
      path: ["category_id"],
    });
  }
  
  if (data.attributes !== undefined && data.subcategory_id === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "subcategory_id must be provided when filtering by attributes",
      path: ["subcategory_id"],
    });
  }
});

export type GetProductsQuery = z.infer<typeof getProductsSchema>;

export const getProductByIdSchema = z.object({
  product_id: z.coerce.number().min(1, "Product ID must be a positive number"),
});

export type GetProductByIdParams = z.infer<typeof getProductByIdSchema>;