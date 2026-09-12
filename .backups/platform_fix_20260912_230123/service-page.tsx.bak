import { notFound } from "next/navigation";
import { prisma } from "@zeal/database";
import { getService } from "@/lib/services";
import { ServicePageClient } from "./ServicePageClient";
import type { ConsultantProfile } from "@zeal/types";
import type { Metadata } from "next";

interface ServicePageProps {
  params: Promise<{ category: string; service: string }>;
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { category, service: serviceSlug } = await params;
  const service = getService(category, serviceSlug);
  if (!service) return { title: "Service not found" };

  return {
    title: `${service.displayName} – ${service.categoryName} | Zeal`,
    description: service.description,
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { category, service: serviceSlug } = await params;
  const service = getService(category, serviceSlug);
  if (!service) notFound();

  const consultants = await prisma.consultant.findMany({
    where: {
      category: service.category as never,
      specialties: { hasSome: service.specialties },
      status: "VERIFIED",
      isActive: true,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
        },
      },
    },
    orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
    take: 60,
  });

  // Collect all unique languages for the filter bar
  const languageSet = new Set<string>();
  for (const c of consultants) {
    for (const lang of c.languages || []) languageSet.add(lang);
  }
  const languages = Array.from(languageSet).sort();

  // Map to ConsultantProfile shape expected by ConsultantCard
  const profiles: ConsultantProfile[] = consultants.map((c) => ({
    id: c.id,
    userId: c.userId,
    name: c.user.name || c.user.username,
    username: c.user.username,
    bio: c.bio || "",
    avatar: c.user.avatar || "",
    category: c.category as never,
    isVerified: c.isVerified,
    isOnline: c.isActive,
    perMinuteRate: c.perMinuteRate,
    experience: 0,
    rating: c.rating,
    totalConsultations: c.totalConsultations,
    sparks: 0,
    languages: c.languages || [],
    specialties: c.specialties || [],
    faith: c.faith as never,
  }));

  return (
    <ServicePageClient
      service={service}
      consultants={profiles}
      languages={languages}
    />
  );
}

// BATCH_F1_APPLIED
