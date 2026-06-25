"use client";

import { cn } from "@/lib/utils";
import { REGISTRATION_STEPS, type RegistrationStepId } from "@/lib/constants";

type ProgressBarProps = {
  currentStep: RegistrationStepId;
};

export function RegistrationProgressBar({ currentStep }: ProgressBarProps) {
  const currentIndex = REGISTRATION_STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="mb-8">
      <div className="flex gap-2">
        {REGISTRATION_STEPS.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = step.id === currentStep;
          return (
            <div key={step.id} className="flex-1">
              <div
                className={cn(
                  "h-2 rounded-pill transition-colors",
                  isComplete || isCurrent ? "bg-plum-500" : "bg-lavender-100",
                  isCurrent && "animate-pulse"
                )}
              />
              <p
                className={cn(
                  "mt-2 hidden text-center text-body-sm sm:block",
                  isCurrent ? "font-semibold text-plum-700" : "text-ink-600"
                )}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
