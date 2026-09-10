"use client";

import { useState, useMemo } from "react";
import { ServiceHero } from "@/components/services/ServiceHero";
import {
  ServiceFilterBar,
  type ServiceFilters,
} from "@/components/services/ServiceFilterBar";
import { ConsultantGrid } from "@/components/services/ConsultantGrid";
import type { ServiceDefinition } from "@/lib/services";
import type { ConsultantProfile } from "@zeal/types";

interface ServicePageClientProps {
  service: ServiceDefinition;
  consultants: ConsultantProfile[];
  languages: string[];
}

const DEFAULT_FILTERS: ServiceFilters = {
  onlineOnly: false,
  maxPrice: 500,
  minRating: 0,
  language: "",
};

export function ServicePageClient({
  service,
  consultants,
  languages,
}: ServicePageClientProps) {
  const [filters, setFilters] = useState<ServiceFilters>(DEFAULT_FILTERS);

  const filtered = useMemo(() => {
    return consultants.filter((c) => {
      if (filters.onlineOnly && !c.isOnline) return false;
      if ((c.perMinuteRate || 50) > filters.maxPrice) return false;
      if ((c.rating || 0) < filters.minRating) return false;
      if (
        filters.language &&
        !(c.languages || []).includes(filters.language)
      )
        return false;
      return true;
    });
  }, [consultants, filters]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <ServiceHero
        icon={service.icon}
        displayName={service.displayName}
        categoryName={service.categoryName}
        categoryId={service.categoryId}
        description={service.description}
        consultantCount={consultants.length}
      />

      <ServiceFilterBar
        filters={filters}
        onChange={setFilters}
        languages={languages}
      />

      <ConsultantGrid consultants={filtered} />
    </div>
  );
}

// BATCH_F1_APPLIED
