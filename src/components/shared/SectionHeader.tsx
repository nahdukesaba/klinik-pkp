/**
 * SectionHeader Component
 * 
 * Reusable section header dengan badge dan title.
 * Untuk konsistensi layout di seluruh halaman.
 */

interface SectionHeaderProps {
  badge: string;
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeader({
  badge,
  title,
  description,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`text-center max-w-2xl mx-auto mb-10 animate-on-scroll ${className}`}>
      <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4 border border-primary/20">
        {badge}
      </span>
      <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
        {title}
      </h2>
      {description && (
        <p className="text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
