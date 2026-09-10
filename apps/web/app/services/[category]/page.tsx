import Link from "next/link";
import { getServicesByCategory } from "@/lib/services";
import { CATEGORY_ID_TO_NAME } from "@/lib/services/slug";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const services = getServicesByCategory(category);
  const categoryName = CATEGORY_ID_TO_NAME[category];

  if (!categoryName || services.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-[#5E4B8B] dark:text-white mb-2">
          Category not found
        </h1>
        <Link href="/services" className="text-[#9D7DC5] hover:underline">
          ← Back to Zeal Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href="/services"
        className="text-sm text-[#9D7DC5] hover:underline mb-4 inline-block"
      >
        ← Back to Zeal Hub
      </Link>

      <h1 className="text-3xl font-bold text-[#5E4B8B] dark:text-white mb-2">
        {categoryName}
      </h1>
      <p className="text-[#B8A1D9] dark:text-gray-400 mb-6">
        Explore {services.length} services in this category
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {services.map((s) => (
          <Link
            key={`${s.categoryId}/${s.serviceSlug}`}
            href={`/services/${s.categoryId}/${s.serviceSlug}`}
            className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-[#E1C5E7] dark:border-gray-700 hover:shadow-lg transition-all flex items-center gap-3"
          >
            <span className="text-3xl">{s.icon}</span>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-[#5E4B8B] dark:text-white">
                {s.displayName}
              </h2>
              <p className="text-xs text-[#B8A1D9] line-clamp-1">
                {s.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// BATCH_F1_APPLIED
