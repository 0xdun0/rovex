import { RovexLoadingScreen } from '@/components/loading-screen'; // animacao tatica de radar e varredura

// fallback de suspense para transicoes dentro do dashboard
export default function DashboardLoading() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center p-4 bg-background text-foreground">
      <RovexLoadingScreen /> {/* radar concentrico com micro-copia progressiva */}
    </div>
  );
}
