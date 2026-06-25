"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import {
  registrationSchema,
  type RegistrationFormData,
} from "@/lib/schemas/registration";
import {
  COMING_OPTIONS,
  CO_CREATION_DOMAINS,
  GATHERING_DATES,
  DEFAULT_DATES,
  OPERATIONAL_SHIFTS,
  type RegistrationStepId,
} from "@/lib/constants";
import type { Profile, LinkedGuest } from "@/lib/types/database";
import { RegistrationProgressBar } from "@/components/registration/ProgressBar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { Card } from "@/components/ui/Card";
import { DateChipSelector } from "@/components/ui/DateChipSelector";
import { markdownToHtml } from "@/lib/utils";
import { Plus, Trash } from "@phosphor-icons/react";
import { CoCreationIcon } from "@/components/registration/CoCreationIcon";
import { ClaimLinkCopy } from "@/components/registration/ClaimLinkCopy";
import { PhotoUpload } from "@/components/registration/PhotoUpload";

const STEP_ORDER: RegistrationStepId[] = [
  "profile",
  "co-create",
  "payments",
  "logistics",
];

const stepTints = {
  profile: "lavender",
  "co-create": "sage",
  payments: "peach",
  logistics: "teal",
} as const;

type LinkedGuestDraft = { id?: string; name: string; bio?: string; claim_token?: string };

type Props = {
  profile: Profile;
  linkedGuests: LinkedGuest[];
  coCreationDomains: string[];
  operationalShifts: string[];
  paymentInstructions: string | null;
  initialStep?: RegistrationStepId;
  isAdminEdit?: boolean;
  editProfileId?: string;
};

function profileToForm(profile: Profile): RegistrationFormData {
  return {
    name: profile.name || "",
    email: profile.email || "",
    photo_url: profile.photo_url || "",
    bio: profile.bio || "",
    is_coming: profile.is_coming || undefined,
    dates: profile.dates?.length ? profile.dates : [...DEFAULT_DATES],
    location_from: profile.location_from || "",
    what_bringing_to_support: profile.what_bringing_to_support || "",
    desires_for_gathering: profile.desires_for_gathering || "",
    needs_financial_assistance: profile.needs_financial_assistance || "",
    has_extra_to_contribute: profile.has_extra_to_contribute || "",
    payment_sent_checkbox: profile.payment_sent_checkbox ?? false,
    will_pay_by_aug31_checkbox: profile.will_pay_by_aug31_checkbox ?? false,
    cabin_or_tent: profile.cabin_or_tent || "",
    bunk_preference: profile.bunk_preference || "",
    needs_bedding: profile.needs_bedding ?? undefined,
    has_extra_bedding: profile.has_extra_bedding ?? undefined,
    dietary_restrictions: profile.dietary_restrictions || "",
    other_needs: profile.other_needs || "",
    co_creation_domains: [],
    operational_shifts: [],
  };
}

export function RegistrationForm({
  profile,
  linkedGuests: initialLinkedGuests,
  coCreationDomains: initialCoCreation,
  operationalShifts: initialOperational,
  paymentInstructions,
  initialStep = "profile",
  isAdminEdit = false,
  editProfileId,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState<RegistrationStepId>(initialStep);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [linkedGuests, setLinkedGuests] = useState<LinkedGuestDraft[]>(
    initialLinkedGuests.map((g) => ({
      id: g.id,
      name: g.name,
      bio: g.bio || "",
      claim_token: g.claim_token,
    }))
  );
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(profile.registration_complete);

  const targetProfileId = editProfileId || profile.id;

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      ...profileToForm(profile),
      co_creation_domains: initialCoCreation,
      operational_shifts: initialOperational,
    },
  });

  const { register, control, watch, setValue, getValues, trigger, formState: { errors } } = form;
  const bio = watch("bio") || "";

  const saveProfile = useCallback(async () => {
    setSaveStatus("saving");
    const values = getValues();
    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        name: values.name,
        email: values.email,
        photo_url: values.photo_url || null,
        bio: values.bio || null,
        is_coming: values.is_coming || null,
        dates: values.dates,
        location_from: values.location_from || null,
        what_bringing_to_support: values.what_bringing_to_support || null,
        desires_for_gathering: values.desires_for_gathering || null,
        needs_financial_assistance: values.needs_financial_assistance || null,
        has_extra_to_contribute: values.has_extra_to_contribute || null,
        payment_sent_checkbox: values.payment_sent_checkbox,
        will_pay_by_aug31_checkbox: values.will_pay_by_aug31_checkbox,
        cabin_or_tent: values.cabin_or_tent || null,
        bunk_preference: values.bunk_preference || null,
        needs_bedding: values.needs_bedding ?? null,
        has_extra_bedding: values.has_extra_bedding ?? null,
        dietary_restrictions: values.dietary_restrictions || null,
        other_needs: values.other_needs || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", targetProfileId);

    if (error) {
      setSaveStatus("idle");
      console.error(error);
      return;
    }

    // Sync linked guests
    for (const guest of linkedGuests) {
      if (!guest.name.trim()) continue;
      if (guest.id) {
        await supabase
          .from("linked_guests")
          .update({ name: guest.name, bio: guest.bio || null })
          .eq("id", guest.id);
      } else {
        const { data: inserted } = await supabase
          .from("linked_guests")
          .insert({
            parent_profile_id: targetProfileId,
            name: guest.name,
            bio: guest.bio || null,
            prepopulated_from_parent: {
              location_from: values.location_from,
              dates: values.dates,
            },
          })
          .select("id, claim_token")
          .single();
        if (inserted) {
          setLinkedGuests((prev) =>
            prev.map((g) =>
              g.name === guest.name && !g.id
                ? { ...g, id: inserted.id, claim_token: inserted.claim_token }
                : g
            )
          );
        }
      }
    }

    // Sync co-creation
    await supabase
      .from("co_creation_interests")
      .delete()
      .eq("profile_id", targetProfileId);
    if (values.co_creation_domains.length) {
      await supabase.from("co_creation_interests").insert(
        values.co_creation_domains.map((domain) => ({
          profile_id: targetProfileId,
          domain,
        }))
      );
    }

    await supabase
      .from("operational_shifts")
      .delete()
      .eq("profile_id", targetProfileId);
    if (values.operational_shifts.length) {
      await supabase.from("operational_shifts").insert(
        values.operational_shifts.map((shift_type) => ({
          profile_id: targetProfileId,
          shift_type,
        }))
      );
    }

    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  }, [getValues, linkedGuests, targetProfileId]);

  const handleBlur = () => {
    void saveProfile();
  };

  const stepIndex = STEP_ORDER.indexOf(step);

  const goNext = async () => {
    let fieldsToValidate: (keyof RegistrationFormData)[] = [];
    if (step === "profile") fieldsToValidate = ["name"];
    if (step === "logistics") fieldsToValidate = ["email"];

    const valid = fieldsToValidate.length
      ? await trigger(fieldsToValidate)
      : true;
    if (!valid) return;

    await saveProfile();
    if (stepIndex < STEP_ORDER.length - 1) {
      setStep(STEP_ORDER[stepIndex + 1]);
    }
  };

  const goBack = () => {
    if (stepIndex > 0) setStep(STEP_ORDER[stepIndex - 1]);
  };

  const handleComplete = async () => {
    const valid = await trigger(["name", "email"]);
    if (!valid) {
      setStep("logistics");
      return;
    }

    setSubmitting(true);
    await saveProfile();

    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ registration_complete: true })
      .eq("id", targetProfileId);

    setSubmitting(false);
    if (isAdminEdit) {
      router.push("/admin");
      router.refresh();
      return;
    }
    setComplete(true);
    router.refresh();
  };

  const removeGuest = async (index: number) => {
    const guest = linkedGuests[index];
    if (guest.id) {
      const supabase = createClient();
      await supabase.from("linked_guests").delete().eq("id", guest.id);
    }
    setLinkedGuests((prev) => prev.filter((_, i) => i !== index));
  };

  if (complete && !isAdminEdit) {
    return (
      <Card tint="sage" className="text-center">
        <h2 className="text-display-md">You&apos;re registered!</h2>
        <p className="mt-3 text-body-md text-ink-600">
          Thank you for sharing your profile. You can come back anytime to update
          your answers — there&apos;s no cutoff date.
        </p>
        <Button className="mt-6" onClick={() => router.push("/dashboard")}>
          Go to your dashboard
        </Button>
      </Card>
    );
  }

  const tint = stepTints[step];

  return (
    <div>
      {!isAdminEdit && <RegistrationProgressBar currentStep={step} />}

      <Card
        tint={tint === "lavender" ? "lavender" : tint === "sage" ? "sage" : tint === "peach" ? "peach" : "teal"}
        className="relative"
      >
        {saveStatus === "saved" && (
          <p className="absolute right-6 top-6 text-body-sm text-sage-600">
            Saved ✓
          </p>
        )}

        {step === "profile" && (
          <div className="space-y-5" onBlur={handleBlur}>
            <div>
              <h2 className="text-display-md">Your public profile</h2>
              <p className="mt-1 text-body-sm text-ink-600">
                Only name is required. Everything else helps the village know you.
              </p>
            </div>

            <Input
              label="Name *"
              error={errors.name?.message}
              {...register("name")}
            />

            <PhotoUpload
              userId={profile.user_id}
              value={watch("photo_url")}
              onChange={(url) => {
                setValue("photo_url", url);
                void saveProfile();
              }}
              onBlur={handleBlur}
            />

            <Textarea
              label="Bio"
              value={bio}
              {...register("bio")}
            />

            <div>
              <p className="text-label mb-2 text-ink-600">Are you coming?</p>
              <div className="flex flex-wrap gap-2">
                {COMING_OPTIONS.map((opt) => (
                  <label key={opt.value} className="cursor-pointer">
                    <input
                      type="radio"
                      value={opt.value}
                      className="peer sr-only"
                      {...register("is_coming")}
                    />
                    <span className="inline-block rounded-pill border border-lavender-300 px-4 py-2 text-body-sm peer-checked:border-plum-500 peer-checked:bg-plum-100 peer-checked:text-plum-700">
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <Controller
              control={control}
              name="dates"
              render={({ field }) => (
                <DateChipSelector
                  dates={GATHERING_DATES}
                  selected={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <Input label="Where are you coming from?" {...register("location_from")} />

            <Textarea
              label="What might you bring to support the village?"
              value={watch("what_bringing_to_support") || ""}
              {...register("what_bringing_to_support")}
            />

            <Textarea
              label="Desires for this year's gathering"
              value={watch("desires_for_gathering") || ""}
              {...register("desires_for_gathering")}
            />

            <div className="border-t border-lavender-100 pt-5">
              <h3 className="text-display-sm">Who are you bringing?</h3>
              <p className="mt-1 text-body-sm italic text-ink-600">
                Add family or friends who aren&apos;t registering separately.
              </p>
              <div className="mt-4 space-y-3">
                {linkedGuests.map((guest, index) => (
                  <div
                    key={guest.id || index}
                    className="flex gap-3 rounded-md bg-white p-4 shadow-soft"
                  >
                    <div className="flex-1 space-y-2">
                      <Input
                        label="Their name"
                        value={guest.name}
                        onChange={(e) => {
                          const next = [...linkedGuests];
                          next[index] = { ...next[index], name: e.target.value };
                          setLinkedGuests(next);
                        }}
                        onBlur={handleBlur}
                      />
                      {guest.claim_token && guest.name && (
                        <ClaimLinkCopy
                          claimToken={guest.claim_token}
                          guestName={guest.name}
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeGuest(index)}
                      className="self-end p-2 text-ink-600 hover:text-error"
                      aria-label="Remove guest"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    setLinkedGuests([...linkedGuests, { name: "" }])
                  }
                >
                  <Plus size={18} /> Add someone
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === "co-create" && (
          <div className="space-y-6" onBlur={handleBlur}>
            <div>
              <h2 className="text-display-md">Co-create with us</h2>
              <p className="mt-2 text-body-sm italic text-ink-600">
                This isn&apos;t a locked-in sign-up — saying yes here just means
                you might end up on a collaborative team.
              </p>
            </div>

            <div>
              <h3 className="text-display-sm mb-3">Co-thinking around design</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {CO_CREATION_DOMAINS.map((domain) => {
                  const selected = watch("co_creation_domains").includes(domain.value);
                  return (
                    <Checkbox
                      key={domain.value}
                      tile
                      selected={selected}
                      label={
                        <span className="flex items-start gap-2">
                          <CoCreationIcon
                            name={domain.icon}
                            className="mt-0.5 shrink-0 text-plum-500"
                          />
                          {domain.label}
                        </span>
                      }
                      checked={selected}
                      onChange={(e) => {
                        const current = getValues("co_creation_domains");
                        setValue(
                          "co_creation_domains",
                          e.target.checked
                            ? [...current, domain.value]
                            : current.filter((v) => v !== domain.value)
                        );
                      }}
                    />
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-display-sm mb-3">Operational support</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {OPERATIONAL_SHIFTS.map((shift) => {
                  const selected = watch("operational_shifts").includes(shift.value);
                  return (
                    <Checkbox
                      key={shift.value}
                      tile
                      selected={selected}
                      label={
                        <span className="flex items-start gap-2">
                          <CoCreationIcon
                            name={shift.icon}
                            className="mt-0.5 shrink-0 text-plum-500"
                          />
                          {shift.label}
                        </span>
                      }
                      checked={selected}
                      onChange={(e) => {
                        const current = getValues("operational_shifts");
                        setValue(
                          "operational_shifts",
                          e.target.checked
                            ? [...current, shift.value]
                            : current.filter((v) => v !== shift.value)
                        );
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === "payments" && (
          <div className="space-y-5" onBlur={handleBlur}>
            <div>
              <h2 className="text-display-md">Payments</h2>
              <p className="mt-1 text-body-sm text-ink-600">
                Private — only you and the host crew can see this section.
              </p>
            </div>

            {paymentInstructions && (
              <div
                className="prose-vpg rounded-md bg-white p-4"
                dangerouslySetInnerHTML={{
                  __html: markdownToHtml(paymentInstructions),
                }}
              />
            )}

            <Textarea
              label="Do you need financial assistance?"
              value={watch("needs_financial_assistance") || ""}
              maxLength={500}
              {...register("needs_financial_assistance")}
            />

            <Textarea
              label="Do you have extra to contribute?"
              value={watch("has_extra_to_contribute") || ""}
              maxLength={500}
              {...register("has_extra_to_contribute")}
            />

            <Checkbox
              label="I have sent my payment"
              {...register("payment_sent_checkbox")}
            />

            <Checkbox
              label="I will pay by Aug 31"
              {...register("will_pay_by_aug31_checkbox")}
            />
          </div>
        )}

        {step === "logistics" && (
          <div className="space-y-5" onBlur={handleBlur}>
            <div>
              <h2 className="text-display-md">Logistics</h2>
              <p className="mt-1 text-body-sm text-ink-600">
                Private — helps us coordinate cabins, bedding, and meals.
              </p>
            </div>

            <Input
              label="Email *"
              type="email"
              error={errors.email?.message}
              {...register("email")}
            />

            <Input label="Cabin or tent?" {...register("cabin_or_tent")} />

            <Textarea
              label="Who do you want to bunk with?"
              value={watch("bunk_preference") || ""}
              maxLength={300}
              {...register("bunk_preference")}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Checkbox
                label="I need to borrow bedding"
                checked={watch("needs_bedding") === true}
                onChange={(e) => setValue("needs_bedding", e.target.checked)}
              />
              <Checkbox
                label="I have extra bedding to share"
                checked={watch("has_extra_bedding") === true}
                onChange={(e) => setValue("has_extra_bedding", e.target.checked)}
              />
            </div>

            <Textarea
              label="Dietary restrictions"
              value={watch("dietary_restrictions") || ""}
              maxLength={500}
              {...register("dietary_restrictions")}
            />

            <Textarea
              label="Other needs"
              value={watch("other_needs") || ""}
              maxLength={500}
              {...register("other_needs")}
            />
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-lavender-100 pt-6">
          <div>
            {stepIndex > 0 && (
              <Button type="button" variant="ghost" onClick={goBack}>
                ← Back
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            {isAdminEdit && (
              <Button type="button" variant="secondary" onClick={() => router.push("/admin")}>
                Cancel
              </Button>
            )}
            {stepIndex < STEP_ORDER.length - 1 ? (
              <Button type="button" onClick={goNext}>
                Save & continue →
              </Button>
            ) : (
              <Button type="button" loading={submitting} onClick={handleComplete}>
                {isAdminEdit ? "Save changes" : "Complete registration"}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
