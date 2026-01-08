"use client";

// ============================================
// ProgressIndicator Component
// Menampilkan indikator progress untuk step-step
// Hanya menyala pada step yang sedang di-hover
// ============================================

interface ProgressIndicatorProps {
  totalSteps: number;
  hoveredStep: number | null;
}

export function ProgressIndicator({ totalSteps, hoveredStep }: ProgressIndicatorProps) {
  return (
    <div className="mt-8 text-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border shadow-sm">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const stepNumber = index + 1;
            const isCurrentlyHovered = hoveredStep === stepNumber;
            const isLastStep = stepNumber === 6;
            // Only the last step (step 6) should be green when hovered
            // All other steps including step 4 should be blue (primary)
            const shouldBeGreen = isLastStep && isCurrentlyHovered;

            return (
              <div
                key={index}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  isCurrentlyHovered
                    ? shouldBeGreen
                      ? "bg-green-500 scale-125"
                      : "bg-primary scale-125"
                    : "bg-muted-foreground/30"
                }`}
              />
            );
          })}
        </div>
        <span className="text-xs text-muted-foreground ml-2">
          {hoveredStep !== null
            ? `Langkah ${hoveredStep} dari ${totalSteps}`
            : `${totalSteps} Tahapan`}
        </span>
      </div>
    </div>
  );
}

export default ProgressIndicator;
