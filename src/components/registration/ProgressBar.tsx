"use client";

import { cn } from "@/lib/utils";
import { REGISTRATION_STEPS, type RegistrationStepId } from "@/lib/constants";

type ProgressBarProps = {
  currentStep: RegistrationStepId;
  onStepClick: (stepId: RegistrationStepId) => void;
};

export function RegistrationProgressBar({
  currentStep,
  onStepClick,
}: ProgressBarProps) {
  const currentIndex = REGISTRATION_STEPS.findIndex((s) => s.id === currentStep);

  return (
    <nav className="mb-8" aria-label="Registration steps">
      <ol className="flex gap-2">
        {REGISTRATION_STEPS.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = step.id === currentStep;
          return (
            <li key={step.id} className="flex-1">
              <button
                type="button"
                onClick={() => onStepClick(step.id)}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "group w-full rounded-md text-left transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum-500 focus-visible:ring-offset-2",
                  !isCurrent && "hover:opacity-80"
                )}
              >
                <div
                  className={cn(
                    "h-2 rounded-pill transition-colors",
                    isComplete || isCurrent ? "bg-plum-500" : "bg-lavender-100",
                    isCurrent && "animate-pulse",
                    !isCurrent && "group-hover:bg-plum-300"
                  )}
                />
                <p
                  className={cn(
                    "mt-2 text-center text-body-sm",
                    isCurrent ? "font-semibold text-plum-700" : "text-ink-600",
                    !isCurrent && "group-hover:text-plum-700"
                  )}
                >
                  {step.label}
                </p>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
