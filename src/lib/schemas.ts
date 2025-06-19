import { z } from "zod";

export const SubmissionFormSchema = z.object({
    codesMissed: z
        .array(
            z.object({
                value: z.string().min(1, "Code value cannot be empty"),
                label: z.string().min(1, "Code label cannot be empty"),
            })
        )
        .min(1, "At least one missed code is required"),

    codesCorrected: z
        .array(
            z.object({
                value: z.string().min(1, "Code value cannot be empty"),
                label: z.string().min(1, "Code label cannot be empty"),
            })
        )
        .min(1, "At least one corrected code is required"),

    auditRemarks: z.string().min(150, "Audit remark must be at least 150 characters long"),
    rating: z
        .number({
            required_error: "Rating is required",
            invalid_type_error: "Rating must be a number",
        })
        .min(1, { message: "Rating must be at least 1" })
        .max(100, { message: "Rating must not exceed 100" }),

});

export type SubmissionFormData = z.infer<typeof SubmissionFormSchema>;
