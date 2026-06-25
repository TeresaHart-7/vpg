export type ComingStatus = "yes" | "no" | "maybe";

export type Profile = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  photo_url: string | null;
  bio: string | null;
  is_coming: ComingStatus | null;
  dates: string[] | null;
  location_from: string | null;
  what_bringing_to_support: string | null;
  desires_for_gathering: string | null;
  cabin_or_tent: string | null;
  bunk_preference: string | null;
  needs_bedding: boolean | null;
  has_extra_bedding: boolean | null;
  dietary_restrictions: string | null;
  other_needs: string | null;
  needs_financial_assistance: string | null;
  has_extra_to_contribute: string | null;
  payment_sent_checkbox: boolean;
  will_pay_by_aug31_checkbox: boolean;
  visibility_overrides: Record<string, boolean>;
  is_admin: boolean;
  registration_complete: boolean;
  created_at: string;
  updated_at: string;
};

export type LinkedGuest = {
  id: string;
  parent_profile_id: string;
  name: string;
  photo_url: string | null;
  bio: string | null;
  is_claimed: boolean;
  claimed_by_user_id: string | null;
  claim_token: string;
  prepopulated_from_parent: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type AdminContentBlock = {
  id: string;
  key: string;
  content: string;
  updated_by: string | null;
  updated_at: string;
};

export type ProfilePublic = Pick<
  Profile,
  | "id"
  | "name"
  | "photo_url"
  | "bio"
  | "is_coming"
  | "dates"
  | "location_from"
  | "what_bringing_to_support"
  | "desires_for_gathering"
>;

/** Fields visible to other participants (not owner/admin) */
export const PUBLIC_PROFILE_FIELDS = [
  "name",
  "photo_url",
  "bio",
  "is_coming",
  "dates",
  "location_from",
  "what_bringing_to_support",
  "desires_for_gathering",
] as const;

export function getPaymentStatus(profile: Pick<Profile, "payment_sent_checkbox" | "will_pay_by_aug31_checkbox">) {
  if (profile.payment_sent_checkbox) return "paid" as const;
  if (profile.will_pay_by_aug31_checkbox) return "pending" as const;
  return "unpaid" as const;
}

export function formatDates(dates: string[] | null | undefined) {
  if (!dates?.length) return "—";
  return dates
    .map((d) =>
      new Date(d + "T12:00:00").toLocaleDateString("en-CA", {
        month: "short",
        day: "numeric",
      })
    )
    .join(", ");
}
