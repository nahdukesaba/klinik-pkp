"use client";

import { useState } from "react";

import Link from "next/link";

import {
  ChevronDown,
  ExternalLink,
  MapPin,
} from "lucide-react";

import {
  type MenuItem,
  type SubMenuItem,
  isExternalUrl,
} from "@/components/layout/navbar-config";
import { cn } from "@/lib/utils";

interface DesktopMenuItemProps {
  item: MenuItem;
  isOpen: boolean;
  isActive: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function DesktopMenuItem({
  item,
  isOpen,
  isActive,
  onMouseEnter,
  onMouseLeave,
}: DesktopMenuItemProps) {
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);

  if (item.href) {
    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-all duration-200",
          "hover:bg-primary/10 hover:text-primary",
          isActive && "bg-primary/15 text-primary font-semibold"
        )}
      >
        {item.icon}
        <span className="break-words leading-snug">{item.label}</span>
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={() => {
        onMouseLeave();
        setActiveSubMenu(null);
      }}
    >
      <button
        type="button"
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-all duration-200",
          "hover:bg-primary/10 hover:text-primary",
          (isOpen || isActive) && "bg-primary/15 text-primary font-semibold"
        )}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {item.icon}
        <span className="break-words leading-snug">{item.label}</span>
        {item.subItems && (
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        )}
      </button>

      {isOpen && item.subItems && (
        <div className="absolute left-0 top-full z-50 pt-2 animate-fade-in">
          <div className="w-[min(14rem,calc(100vw-2rem))] rounded-xl border border-border bg-card py-2 shadow-xl">
            {item.subItems.map((subItem) => (
              <div
                key={subItem.label}
                className="relative"
                onMouseEnter={() =>
                  subItem.subItems && setActiveSubMenu(subItem.label)
                }
                onMouseLeave={() =>
                  !subItem.subItems && setActiveSubMenu(null)
                }
              >
                {subItem.href ? (
                  isExternalUrl(subItem.href) ? (
                    <a
                      href={subItem.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start justify-between gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <span className="min-w-0 break-words leading-snug">
                        {subItem.label}
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                    </a>
                  ) : (
                    <Link
                      href={subItem.href}
                      className="flex items-start justify-between gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <span className="min-w-0 break-words leading-snug">
                        {subItem.label}
                      </span>
                    </Link>
                  )
                ) : (
                  <div className="flex cursor-pointer items-start justify-between gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground">
                    <span className="min-w-0 break-words leading-snug">
                      {subItem.label}
                    </span>
                    {subItem.subItems && (
                      <ChevronDown className="h-4 w-4 flex-shrink-0 -rotate-90" />
                    )}
                  </div>
                )}

                {activeSubMenu === subItem.label && subItem.subItems && (
                  <div className="absolute left-full top-0 z-50 ml-1 animate-fade-in">
                    <div className="w-[min(13rem,calc(100vw-2rem))] rounded-xl border border-border bg-card py-2 shadow-xl">
                      {subItem.subItems.map((nestedItem) => (
                        <Link
                          key={nestedItem.href}
                          href={nestedItem.href}
                          className="flex items-start gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                          <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
                          <span className="break-words leading-snug">
                            {nestedItem.label}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface MobileMenuItemProps {
  item: MenuItem;
  isActive: boolean;
  onClose: () => void;
}

export function MobileMenuItem({
  item,
  onClose,
  isActive,
}: MobileMenuItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (item.href) {
    return (
      <Link
        href={item.href}
        onClick={onClose}
        className={cn(
          "flex items-start gap-3 rounded-lg px-4 py-3 text-left text-base font-medium transition-colors hover:bg-accent",
          isActive && "bg-primary/15 text-primary font-semibold"
        )}
      >
        {item.icon}
        <span className="break-words leading-snug">{item.label}</span>
      </Link>
    );
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => setIsExpanded((current) => !current)}
        className={cn(
          "flex w-full items-start justify-between rounded-lg px-4 py-3 text-left text-base font-medium transition-colors hover:bg-accent",
          isActive && "bg-primary/15 text-primary font-semibold"
        )}
        aria-expanded={isExpanded}
        aria-haspopup="menu"
      >
        <div className="flex items-start gap-3">
          {item.icon}
          <span className="break-words leading-snug">{item.label}</span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {isExpanded && item.subItems && (
        <div className="space-y-1 pl-6">
          {item.subItems.map((subItem) =>
            subItem.href ? (
              isExternalUrl(subItem.href) ? (
                <a
                  key={subItem.label}
                  href={subItem.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="flex items-start justify-between gap-3 rounded-lg px-4 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <span className="min-w-0 break-words leading-snug">
                    {subItem.label}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                </a>
              ) : (
                <Link
                  key={subItem.label}
                  href={subItem.href}
                  onClick={onClose}
                  className="block rounded-lg px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {subItem.label}
                </Link>
              )
            ) : (
              <MobileSubMenuItem
                key={subItem.label}
                subItem={subItem}
                onClose={onClose}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

interface MobileSubMenuItemProps {
  subItem: SubMenuItem;
  onClose: () => void;
}

function MobileSubMenuItem({ subItem, onClose }: MobileSubMenuItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsExpanded((current) => !current)}
        className="flex w-full items-start justify-between rounded-lg px-4 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-expanded={isExpanded}
        aria-haspopup="menu"
      >
        <span className="break-words leading-snug">{subItem.label}</span>
        {subItem.subItems && (
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              isExpanded && "rotate-180"
            )}
          />
        )}
      </button>

      {isExpanded && subItem.subItems && (
        <div className="mt-1 space-y-1 pl-4">
          {subItem.subItems.map((nestedItem) => (
            <Link
              key={nestedItem.href}
              href={nestedItem.href}
              onClick={onClose}
              className="flex items-start gap-2 rounded-lg px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <MapPin className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
              <span className="break-words leading-snug">
                {nestedItem.label}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
