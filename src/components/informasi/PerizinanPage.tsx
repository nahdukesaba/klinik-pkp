"use client";

import Link from "next/link";

import {
  FileCheck,
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Building2,
  FileText,
} from "lucide-react";

import { Navbar, Footer } from "@/components/layout";
import { permitSteps, permitTypes, importantNotes } from "@/content/informasi";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Building2,
  FileCheck,
  FileText,
};

export default function PerizinanPage() {
  const ref = useScrollAnimation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main ref={ref} className="pt-24 pb-16">
        {/* Background Pattern */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/60 via-background to-accent-2/20 dark:from-background dark:via-primary/5 dark:to-accent/5" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-2/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12 animate-on-scroll">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4 border border-primary/20">
              <FileCheck className="w-4 h-4" />
              <span>Perizinan</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Panduan Perizinan Bangunan
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Informasi lengkap mengenai prosedur dan persyaratan perizinan
              bangunan untuk pembangunan rumah tinggal
            </p>
          </div>

          {/* Permit Types */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {permitTypes.map((permit, index) => {
              const IconComponent = iconMap[permit.iconName];
              return (
                <div
                  key={index}
                  className="bg-card rounded-2xl border border-border p-6 shadow-lg hover:shadow-xl hover:border-primary/30 transition-all animate-on-scroll"
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground mb-4">
                    {IconComponent && <IconComponent className="w-6 h-6" />}
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {permit.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {permit.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Process Steps */}
          <div className="mb-12 animate-on-scroll">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
              Tahapan Pengurusan Perizinan
            </h2>
            <div className="space-y-6">
              {permitSteps.map((step, index) => (
                <div
                  key={step.step}
                  className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg animate-on-scroll"
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Step Number */}
                    <div className="md:w-24 bg-gradient-to-br from-primary to-accent flex items-center justify-center p-6">
                      <span className="text-4xl font-bold text-primary-foreground">
                        {step.step}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-foreground mb-2">
                            {step.title}
                          </h3>
                          <p className="text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg flex-shrink-0">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-primary">
                            {step.duration}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-foreground mb-3">
                          Dokumen yang Diperlukan:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {step.documents.map((doc, docIndex) => (
                            <span
                              key={docIndex}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary/50 rounded-lg text-sm text-muted-foreground"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                              {doc}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-lg mb-12 animate-on-scroll">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                Catatan Penting
              </h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {importantNotes.map((note, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-secondary/30 rounded-xl"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">{note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center py-12 bg-card rounded-2xl border border-border animate-on-scroll">
            <ClipboardList className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Butuh Bantuan Mengurus Perizinan?
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Tim Klinik PKP siap membantu Anda dalam proses pengurusan
              perizinan bangunan.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/informasi/kontak"
                className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary-hover transition-colors"
              >
                Hubungi Kami
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
