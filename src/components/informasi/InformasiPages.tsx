import type { ReactNode } from "react";

import Image from "next/image";
import Link from "next/link";

import { ArrowUpRight, Building2, CircleAlert } from "lucide-react";

import { Footer, Navbar } from "@/components/layout";
import {
  complaintChannels,
  complaintChannelsPage,
  relatedApplications,
  relatedApplicationsPage,
  type InformasiResourceItem,
  type InformasiResourcePageContent,
} from "@/content/informasi.content";

import BuildingStepsSection from "./BuildingStepsSection";
import HousingIndicatorsSection from "./HousingIndicatorsSection";

import type { LucideIcon } from "lucide-react";

interface InformasiPageShellProps {
  children: ReactNode;
  mainClassName?: string;
}

function InformasiPageShell({
  children,
  mainClassName = "pt-20 pb-12 sm:pt-24 sm:pb-16",
}: InformasiPageShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className={mainClassName}>{children}</main>
      <Footer />
    </div>
  );
}

interface InformasiPageHeaderProps {
  icon: LucideIcon;
  badge: string;
  title: string;
  description: string;
}

function InformasiPageHeader({
  icon: Icon,
  badge,
  title,
  description,
}: InformasiPageHeaderProps) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-primary">
        <Icon className="h-4 w-4" />
        <span>{badge}</span>
      </div>
      <h1 className="text-3xl font-bold text-foreground md:text-5xl">
        {title}
      </h1>
      <p className="mt-4 text-lg leading-8 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function ResourceCard({ item }: { item: InformasiResourceItem }) {
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group rounded-3xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            {item.badge}
          </span>
          <h2 className="mt-4 text-2xl font-bold text-foreground">
            {item.title}
          </h2>
        </div>
        <div className="flex min-h-20 min-w-[140px] items-center justify-center rounded-2xl border border-border bg-background/80 px-4 py-3 shadow-sm">
          <Image
            src={item.logo.src}
            alt={item.logo.alt}
            width={item.logo.width}
            height={item.logo.height}
            className="h-auto max-h-11 w-auto object-contain"
          />
        </div>
      </div>

      <p className="mt-5 text-sm leading-7 text-muted-foreground">
        {item.description}
      </p>

      <div className="mt-5 rounded-2xl border border-border bg-background/60 p-4">
        {item.detailTitle ? (
          <p className="text-sm font-semibold text-foreground">
            {item.detailTitle}
          </p>
        ) : null}
        <p
          className={`text-sm leading-7 text-muted-foreground ${
            item.detailTitle ? "mt-2" : ""
          }`}
        >
          {item.detail}
        </p>
      </div>

      <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
        {item.ctaLabel}
        <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </div>
    </a>
  );
}

interface InformasiResourcePageProps {
  icon: LucideIcon;
  page: InformasiResourcePageContent;
  items: InformasiResourceItem[];
}

function InformasiResourcePage({
  icon,
  page,
  items,
}: InformasiResourcePageProps) {
  return (
    <InformasiPageShell mainClassName="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <InformasiPageHeader
          icon={icon}
          badge={page.badge}
          title={page.title}
          description={page.description}
        />

        <div
          className={`mx-auto mt-10 grid max-w-6xl gap-6 ${
            page.columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"
          }`}
        >
          {items.map((item) => (
            <ResourceCard key={item.slug} item={item} />
          ))}
        </div>

        {page.supportCallout ? (
          <div className="mx-auto mt-10 max-w-6xl rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {page.supportCallout.title}
                </h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {page.supportCallout.description}
                </p>
              </div>
              <Link
                href={page.supportCallout.href}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                {page.supportCallout.ctaLabel}
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </InformasiPageShell>
  );
}

export function RumahLayakHuniPage() {
  return (
    <InformasiPageShell>
      <HousingIndicatorsSection />
    </InformasiPageShell>
  );
}

export function TahapanPage() {
  return (
    <InformasiPageShell>
      <BuildingStepsSection />
    </InformasiPageShell>
  );
}

export function AplikasiTerkaitPage() {
  return (
    <InformasiResourcePage
      icon={Building2}
      page={relatedApplicationsPage}
      items={relatedApplications}
    />
  );
}

export function KanalPengaduanPage() {
  return (
    <InformasiResourcePage
      icon={CircleAlert}
      page={complaintChannelsPage}
      items={complaintChannels}
    />
  );
}
