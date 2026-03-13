// --- StepArrow Component ---
// Garis lurus dengan tanda panah di ujungnya
// Digunakan untuk menghubungkan step di BuildingStepsSection
// Responsive untuk semua device

interface StepArrowProps {
  direction: "right" | "down" | "left";
  isActive: boolean;
  className?: string;
}

export function StepArrow({ direction, isActive, className = "" }: StepArrowProps) {
  // Use primary color when active, dark gray for light mode and light gray for dark mode when inactive
  const activeColor = "#0E5B73";
  const opacity = isActive ? "1" : "0.7";

  // SVG arrow untuk masing-masing arah
  if (direction === "right") {
    return (
      <div className={`flex items-center justify-center flex-shrink-0 ${className}`}>
        <svg
          width="32"
          height="16"
          viewBox="0 0 32 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-all duration-300 w-6 md:w-8"
          style={{ opacity }}
        >
          {/* Garis lurus */}
          <line
            x1="0"
            y1="8"
            x2="24"
            y2="8"
            className="stroke-gray-700 dark:stroke-gray-300"
            style={{ stroke: isActive ? activeColor : undefined }}
            strokeWidth="2"
          />
          {/* Arrow tip */}
          <path
            d="M22 4L30 8L22 12"
            className="stroke-gray-700 dark:stroke-gray-300"
            style={{ stroke: isActive ? activeColor : undefined }}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
    );
  }

  if (direction === "left") {
    return (
      <div className={`flex items-center justify-center flex-shrink-0 ${className}`}>
        <svg
          width="32"
          height="16"
          viewBox="0 0 32 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-all duration-300 w-6 md:w-8"
          style={{ opacity }}
        >
          {/* Garis lurus */}
          <line
            x1="8"
            y1="8"
            x2="32"
            y2="8"
            className="stroke-gray-700 dark:stroke-gray-300"
            style={{ stroke: isActive ? activeColor : undefined }}
            strokeWidth="2"
          />
          {/* Arrow tip pointing left */}
          <path
            d="M10 4L2 8L10 12"
            className="stroke-gray-700 dark:stroke-gray-300"
            style={{ stroke: isActive ? activeColor : undefined }}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
    );
  }

  // direction === "down"
  return (
    <div className={`flex items-center justify-center flex-shrink-0 ${className}`}>
      <svg
        width="16"
        height="28"
        viewBox="0 0 16 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-all duration-300"
        style={{ opacity }}
      >
        {/* Garis lurus vertikal */}
        <line
          x1="8"
          y1="0"
          x2="8"
          y2="20"
          className="stroke-gray-700 dark:stroke-gray-300"
          style={{ stroke: isActive ? activeColor : undefined }}
          strokeWidth="2"
        />
        {/* Arrow tip pointing down */}
        <path
          d="M4 18L8 26L12 18"
          className="stroke-gray-700 dark:stroke-gray-300"
          style={{ stroke: isActive ? activeColor : undefined }}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
}
