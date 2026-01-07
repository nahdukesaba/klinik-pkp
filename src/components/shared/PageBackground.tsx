interface PageBackgroundProps {
  variant?: "default" | "primary" | "accent";
}

export default function PageBackground({ variant = "default" }: PageBackgroundProps) {
  const gradientClass = {
    default: "from-secondary/60 via-background to-accent-2/20 dark:from-background dark:via-primary/5 dark:to-accent/5",
    primary: "from-primary/10 via-background to-accent/10 dark:from-background dark:via-primary/5 dark:to-accent/5",
    accent: "from-accent/10 via-background to-secondary/20 dark:from-background dark:via-accent/5 dark:to-primary/5",
  }[variant];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass}`} />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-2/10 rounded-full blur-3xl" />
    </div>
  );
}
