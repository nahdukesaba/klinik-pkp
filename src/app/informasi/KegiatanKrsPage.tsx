"use client";

import Image from "next/image";
import Link from "next/link";

import {
  Users,
  Calendar,
  MapPin,
  Camera,
  ArrowRight,
  Target,
  CheckCircle2,
} from "lucide-react";

import { Navbar, Footer } from "@/components/layout";
import {
  krsActivities,
  programGoals,
} from "@/data/informasi";
import useScrollAnimation from "@/hooks/use-scroll-animation";

import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Users,
  Target,
  CheckCircle2,
};

export default function KegiatanKRSPage() {
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
              <Users className="w-4 h-4" />
              <span>Kegiatan KRS</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Kelompok Rukun Sejahtera
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Program pemberdayaan masyarakat untuk mendukung keberhasilan
              pembangunan rumah layak huni melalui pelatihan dan pendampingan
            </p>
          </div>

          {/* Program Goals */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {programGoals.map((goal, index) => {
              const IconComponent = iconMap[goal.iconName];
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
                  {goal.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {goal.description}
                </p>
              </div>
              );
            })}
          </div>

          {/* Activities Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-8 animate-on-scroll">
              Kegiatan Terbaru
            </h2>
            <div className="space-y-6">
              {krsActivities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg hover:shadow-xl transition-all animate-on-scroll group"
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="md:w-1/3 aspect-video md:aspect-auto relative overflow-hidden">
                      <Image
                        src={activity.image}
                        alt={activity.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            activity.status === "selesai"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {activity.status === "selesai"
                            ? "Selesai"
                            : "Mendatang"}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="md:w-2/3 p-6">
                      <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {activity.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {activity.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>{activity.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span>{activity.location}</span>
                        </div>
                        {activity.participants > 0 && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            <span>{activity.participants} Peserta</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center py-12 bg-card rounded-2xl border border-border animate-on-scroll">
            <Camera className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Ingin Mengikuti Kegiatan KRS?
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Hubungi kami untuk informasi lebih lanjut mengenai jadwal kegiatan
              dan pendaftaran pelatihan.
            </p>
            <Link
              href="/informasi/kontak"
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary-hover transition-colors"
            >
              Hubungi Kami
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
