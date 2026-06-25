import { z } from "zod";

export const profilePublicSchema = z.object({
  name: z.string().min(1, "Name is required"),
  photo_url: z.string().optional(),
  bio: z.string().max(500, "Bio must be 500 characters or less").optional(),
  is_coming: z.enum(["yes", "no", "maybe"]).optional(),
  dates: z.array(z.string()),
  location_from: z.string().optional(),
  what_bringing_to_support: z.string().optional(),
  desires_for_gathering: z.string().optional(),
});

export const profilePaymentsSchema = z.object({
  needs_financial_assistance: z.string().optional(),
  has_extra_to_contribute: z.string().optional(),
  payment_sent_checkbox: z.boolean(),
  will_pay_by_aug31_checkbox: z.boolean(),
});

export const profileLogisticsSchema = z.object({
  email: z.string().email("A valid email is required"),
  cabin_or_tent: z.string().optional(),
  bunk_preference: z.string().optional(),
  needs_bedding: z.boolean().optional().nullable(),
  has_extra_bedding: z.boolean().optional().nullable(),
  dietary_restrictions: z.string().optional(),
  other_needs: z.string().optional(),
});

export const coCreationSchema = z.object({
  co_creation_domains: z.array(z.string()),
  operational_shifts: z.array(z.string()),
});

export const registrationSchema = profilePublicSchema
  .merge(profilePaymentsSchema)
  .merge(profileLogisticsSchema)
  .merge(coCreationSchema);

export type RegistrationFormData = z.infer<typeof registrationSchema>;
export type ProfilePublicData = z.infer<typeof profilePublicSchema>;
export type ProfilePaymentsData = z.infer<typeof profilePaymentsSchema>;
export type ProfileLogisticsData = z.infer<typeof profileLogisticsSchema>;

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const linkedGuestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  photo_url: z.string().optional(),
  bio: z.string().max(500).optional(),
});

export type LinkedGuestFormData = z.infer<typeof linkedGuestSchema>;
