import { MainLayout } from "@/components/layout/MainLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { ArrowLeftRight } from "lucide-react";

export function TransactionPage() {
  return (
    <MainLayout>
      <div className="flex h-full items-center justify-center p-10">
        <EmptyState
          icon={<ArrowLeftRight size={48} />}
          title="Halaman Transaksi"
          description="Halaman ini sedang dalam pengembangan. Segera hadir!"
          size="lg"
        />
      </div>
    </MainLayout>
  );
}
