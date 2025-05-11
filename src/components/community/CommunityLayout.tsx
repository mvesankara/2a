
import { ReactNode } from "react";
import { CommunityBreadcrumb } from "./CommunityBreadcrumb";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
  ChartConfig 
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

/**
 * Props du composant CommunityLayout
 */
interface CommunityLayoutProps {
  children: ReactNode;
  loading?: boolean;
  showBreadcrumb?: boolean;
  showEventsMetrics?: boolean;
}

/**
 * Layout pour les pages de la section communauté
 */
export const CommunityLayout = ({ 
  children, 
  loading = false,
  showBreadcrumb = true,
  showEventsMetrics = false
}: CommunityLayoutProps) => {
  // Données fictives pour le graphique des événements
  const eventMetricsData = [
    { month: "Jan", count: 2 },
    { month: "Fév", count: 4 },
    { month: "Mar", count: 3 },
    { month: "Avr", count: 5 },
    { month: "Mai", count: 7 },
    { month: "Juin", count: 4 },
    { month: "Juil", count: 6 },
    { month: "Août", count: 3 },
    { month: "Sept", count: 8 },
    { month: "Oct", count: 5 },
    { month: "Nov", count: 4 },
    { month: "Déc", count: 6 },
  ];

  // Configuration du graphique
  const chartConfig: ChartConfig = {
    events: {
      label: "Événements",
      theme: {
        light: "hsl(220, 85%, 60%)",
        dark: "hsl(220, 85%, 60%)",
      },
    },
  };

  return (
    <div className="bg-background min-h-screen pb-12">
      <div className="container mx-auto px-4 py-8">
        {showBreadcrumb && <CommunityBreadcrumb />}
        
        {showEventsMetrics && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Activité des événements</h2>
            <div className="rounded-xl border bg-card p-4">
              <ChartContainer config={chartConfig} className="aspect-[4/1]">
                <AreaChart data={eventMetricsData} margin={{ top: 5, right: 25, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-events)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--color-events)" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent labelKey="month" />} />
                  <Area 
                    type="monotone" 
                    name="events" 
                    dataKey="count" 
                    stroke="var(--color-events)" 
                    fill="url(#colorEvents)" 
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <p className="text-lg">Chargement...</p>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};
