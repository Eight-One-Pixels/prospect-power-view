
import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadReports } from "@/components/reports/LeadReports";
import { ConversionReports } from "@/components/reports/ConversionReports";
import { RevenueReports } from "@/components/reports/RevenueReports";
import { FileText, TrendingUp, DollarSign } from "lucide-react";

const Reports = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Reports & Analytics
          </h1>
          <p className="text-lg text-gray-600">
            Generate comprehensive reports for leads, conversions, and revenue analysis
          </p>
        </div>

        <Tabs defaultValue="leads" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Lead Reports
            </TabsTrigger>
            <TabsTrigger value="conversions" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Conversion Reports
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Revenue Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leads">
            <LeadReports />
          </TabsContent>

          <TabsContent value="conversions">
            <ConversionReports />
          </TabsContent>

          <TabsContent value="revenue">
            <RevenueReports />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Reports;
