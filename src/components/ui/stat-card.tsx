
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    positive: boolean;
  };
  icon?: LucideIcon;
  color?: "blue" | "green" | "red" | "orange" | "purple";
  clickable?: boolean;
  onClick?: () => void;
  loading?: boolean;
}

export const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  color = "blue",
  clickable = false,
  onClick,
  loading
}: StatCardProps) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    red: "bg-red-50 border-red-200 text-red-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700"
  };

  const iconColorClasses = {
    blue: "text-blue-500",
    green: "text-green-500",
    red: "text-red-500",
    orange: "text-orange-500",
    purple: "text-purple-500"
  };

  return (
    <Card
      className={cn(
        "p-6 transition-all duration-200",
        clickable && "cursor-pointer hover:shadow-md hover:scale-[1.02]",
        colorClasses[color]
      )}
      onClick={clickable ? onClick : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          {loading ? (
            <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
          ) : (
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          )}
          {change && (
            <div className="mt-2">
              <Badge
                variant={change.positive ? "default" : "destructive"}
                className="text-xs"
              >
                {change.positive ? "↗" : "↘"} {change.value}
              </Badge>
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn("p-3 rounded-full bg-white/80", iconColorClasses[color])}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </Card>
  );
};
