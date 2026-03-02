import { MainLayout } from "@/components/layout/MainLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { Wallet } from "lucide-react";

export function WalletPage() {
  return (
    <MainLayout>
      <div className="flex h-full items-center justify-center p-10">
        <EmptyState
          icon={<Wallet size={48} />}
          title="Halaman Wallet"
          description="Halaman ini sedang dalam pengembangan. Segera hadir!"
          size="lg"
        />
      </div>
    </MainLayout>
  );
}
