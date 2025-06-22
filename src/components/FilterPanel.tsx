
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Filter, Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";

interface FilterPanelProps {
  filters: {
    dateRange: string;
    leadSource: string;
    status: string;
    assignee: string;
  };
  onFiltersChange: (filters: any) => void;
}

export const FilterPanel = ({ filters, onFiltersChange }: FilterPanelProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const updateFilter = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-md">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="font-semibold text-gray-700">Filters:</span>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Select value={filters.dateRange} onValueChange={(value) => updateFilter("dateRange", value)}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.leadSource} onValueChange={(value) => updateFilter("leadSource", value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Lead Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
                <SelectItem value="email">Email Campaign</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="cold-call">Cold Call</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.assignee} onValueChange={(value) => updateFilter("assignee", value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reps</SelectItem>
                <SelectItem value="digital">Digital Team</SelectItem>
                <SelectItem value="onsite">On-site Reps</SelectItem>
                <SelectItem value="sarah">Sarah Johnson</SelectItem>
                <SelectItem value="mike">Mike Chen</SelectItem>
                <SelectItem value="emma">Emma Davis</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-[200px]"
            />
          </div>
          
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
    </Card>
  );
};
