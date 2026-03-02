import { MainLayout } from "@/components/layout/MainLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { TrendingUp } from "lucide-react";

export function InvestmentPage() {
  return (
    <MainLayout>
      <div className="flex h-full items-center justify-center p-10">
        <EmptyState
          icon={<TrendingUp size={48} />}
          title="Halaman Investasi"
          description="Halaman ini sedang dalam pengembangan. Segera hadir!"
          size="lg"
        />
      </div>
    </MainLayout>
  );
}
