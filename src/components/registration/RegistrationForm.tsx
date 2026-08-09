"use client";

import { useCallback, useRef, useState } from "react";
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
  GATHERING_DATES,
  DEFAULT_DATES,
  OPERATIONAL_SHIFTS,
  REGISTRATION_STEPS,
  type RegistrationStepId,
} from "@/lib/constants";
import type { Profile, LinkedGuest } from "@/lib/types/database";
import type { RegistrationCopy } from "@/lib/content";
import { RegistrationProgressBar } from "@/components/registration/ProgressBar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { Card } from "@/components/ui/Card";
import { DateChipSelector } from "@/components/ui/DateChipSelector";
import { SelectionPill } from "@/components/ui/SelectionPill";
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

type LinkedGuestDraft = { id: string; name: string; bio?: string; claim_token?: string };

type Props = {
  profile: Profile;
  linkedGuests: LinkedGuest[];
  coCreationDomains: string[];
  operationalShifts: string[];
  paymentInstructions: string | null;
  copy: RegistrationCopy;
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
    payment_sent_checkbox: profile.payment_sent_checkbox ?? false,
    will_pay_by_aug31_checkbox: profile.will_pay_by_aug31_checkbox ?? false,
    cabin_or_tent: profile.cabin_or_tent || "",
    bunk_preference: profile.bunk_preference || "",
    needs_bedding: profile.needs_bedding ?? undefined,
    has_extra_bedding: profile.has_extra_bedding ?? undefined,
    bedding_details: profile.bedding_details || "",
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
  copy,
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
  const [justCompleted, setJustCompleted] = useState(false);
  const savedDatesRef = useRef<string[]>([...DEFAULT_DATES]);
  const saveChainRef = useRef<Promise<void>>(Promise.resolve());

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

  const runSave = useCallback(async () => {
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
        payment_sent_checkbox: values.payment_sent_checkbox,
        will_pay_by_aug31_checkbox: values.will_pay_by_aug31_checkbox,
        cabin_or_tent: values.cabin_or_tent || null,
        bunk_preference: values.bunk_preference || null,
        needs_bedding: values.needs_bedding ?? null,
        has_extra_bedding: values.has_extra_bedding ?? null,
        bedding_details: values.bedding_details || null,
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

    // Sync linked guests. Drafts carry a client-generated id, so this upsert
    // is idempotent — a save that runs twice writes the same row instead of
    // inserting a duplicate.
    for (const guest of linkedGuests) {
      if (!guest.name.trim()) continue;
      const { data: saved } = await supabase
        .from("linked_guests")
        .upsert({
          id: guest.id,
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
      if (saved && !guest.claim_token) {
        setLinkedGuests((prev) =>
          prev.map((g) =>
            g.id === saved.id ? { ...g, claim_token: saved.claim_token } : g
          )
        );
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

  // Serialize saves. A field blur and a "Save & continue" click fire nearly
  // simultaneously, and overlapping runs used to insert linked guests twice.
  const saveProfile = useCallback(() => {
    const chained = saveChainRef.current.then(runSave, runSave);
    saveChainRef.current = chained;
    return chained;
  }, [runSave]);

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

  const goToStep = async (targetStep: RegistrationStepId) => {
    if (targetStep === step) return;
    await saveProfile();
    setStep(targetStep);
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
    setJustCompleted(true);
    router.refresh();
  };

  const removeGuest = (index: number) => {
    const guest = linkedGuests[index];
    setLinkedGuests((prev) => prev.filter((_, i) => i !== index));
    // Queue behind in-flight saves so a pending upsert can't resurrect the row.
    const run = async () => {
      const supabase = createClient();
      await supabase.from("linked_guests").delete().eq("id", guest.id);
    };
    saveChainRef.current = saveChainRef.current.then(run, run);
  };

  if (justCompleted && !isAdminEdit) {
    return (
      <Card tint="sage" className="text-center">
        <h2 className="text-display-md">{copy.complete.title}</h2>
        <p className="mt-3 text-body-md text-ink-600">{copy.complete.body}</p>
        <p className="mt-4 text-body-sm text-ink-600">{copy.complete.editPrompt}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {REGISTRATION_STEPS.map((s) => (
            <Button
              key={s.id}
              variant="secondary"
              onClick={() => {
                setJustCompleted(false);
                setStep(s.id);
              }}
            >
              Edit {s.label.toLowerCase()}
            </Button>
          ))}
        </div>
        <Button className="mt-6" onClick={() => router.push("/dashboard")}>
          {copy.complete.dashboardButton}
        </Button>
      </Card>
    );
  }

  const tint = stepTints[step];

  return (
    <div>
      {!isAdminEdit && (
        <RegistrationProgressBar currentStep={step} onStepClick={goToStep} />
      )}

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
              <h2 className="text-display-md">{copy.profile.title}</h2>
              <p className="mt-1 text-body-sm text-ink-600">{copy.profile.subtitle}</p>
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

            <Controller
              control={control}
              name="is_coming"
              render={({ field }) => (
                <div>
                  <p className="text-label mb-2 text-ink-600">Are you coming?</p>
                  <div className="flex flex-wrap gap-2">
                    {COMING_OPTIONS.map((opt) => (
                      <SelectionPill
                        key={opt.value}
                        selected={field.value === opt.value}
                        onClick={() => {
                          field.onChange(opt.value);
                          if (opt.value === "no") {
                            const current = getValues("dates");
                            if (current.length) savedDatesRef.current = current;
                            setValue("dates", []);
                          } else if (opt.value === "yes") {
                            const current = getValues("dates");
                            if (!current.length) {
                              setValue(
                                "dates",
                                savedDatesRef.current.length
                                  ? savedDatesRef.current
                                  : [...DEFAULT_DATES]
                              );
                            }
                          }
                        }}
                      >
                        {opt.label}
                      </SelectionPill>
                    ))}
                  </div>
                </div>
              )}
            />

            <Controller
              control={control}
              name="dates"
              render={({ field }) => (
                <DateChipSelector
                  dates={GATHERING_DATES}
                  selected={field.value}
                  onChange={field.onChange}
                  disabled={watch("is_coming") === "no"}
                  notComingHint={copy.datesNotComingHint}
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
              <h3 className="text-display-sm">{copy.profile.linkedGuestsTitle}</h3>
              <p className="mt-1 text-body-sm italic text-ink-600">
                {copy.profile.linkedGuestsSubtitle}
              </p>
              <div className="mt-4 space-y-3">
                {linkedGuests.map((guest, index) => (
                  <div
                    key={guest.id}
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
                    setLinkedGuests([
                      ...linkedGuests,
                      { id: crypto.randomUUID(), name: "" },
                    ])
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
              <h2 className="text-display-md">{copy.coCreate.title}</h2>
              <p className="mt-2 text-body-sm italic text-ink-600">{copy.coCreate.subtitle}</p>
            </div>

            <div>
              <h3 className="text-display-sm mb-3">{copy.coCreate.coThinkingTitle}</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {copy.coCreationDomains.map((domain) => {
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
              <h3 className="text-display-sm mb-3">{copy.coCreate.operationalTitle}</h3>
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
              <h2 className="text-display-md">{copy.payments.title}</h2>
              <p className="mt-1 text-body-sm text-ink-600">{copy.payments.intro}</p>
              <p className="mt-2 text-body-sm text-ink-600">{copy.payments.privacyNote}</p>
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
              label={copy.payments.financialLabel}
              hint={copy.payments.financialHint}
              value={watch("needs_financial_assistance") || ""}
              maxLength={500}
              {...register("needs_financial_assistance")}
            />

            <Checkbox label={copy.payments.sentCheckbox} {...register("payment_sent_checkbox")} />

            <Checkbox label={copy.payments.aug31Checkbox} {...register("will_pay_by_aug31_checkbox")} />
          </div>
        )}

        {step === "logistics" && (
          <div className="space-y-5" onBlur={handleBlur}>
            <div>
              <h2 className="text-display-md">{copy.logistics.title}</h2>
              <p className="mt-1 text-body-sm text-ink-600">{copy.logistics.subtitle}</p>
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
              hint={copy.logistics.bunkHint}
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

            {(watch("needs_bedding") || watch("has_extra_bedding")) && (
              <Textarea
                label={copy.logistics.beddingDetailsLabel}
                hint={copy.logistics.beddingDetailsHint}
                value={watch("bedding_details") || ""}
                maxLength={500}
                {...register("bedding_details")}
              />
            )}

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
