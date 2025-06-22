
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Phone, Mail, Edit, Eye, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface LeadsTableProps {
  filters: {
    dateRange: string;
    leadSource: string;
    status: string;
    assignee: string;
  };
}

export const LeadsTable = ({ filters }: LeadsTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const leads = [
    {
      id: "L001",
      name: "Alex Thompson",
      company: "Tech Solutions Inc",
      email: "alex@techsolutions.com",
      phone: "+1 (555) 123-4567",
      source: "Website",
      status: "qualified",
      value: 15000,
      assignee: "Sarah Johnson",
      lastContact: "2024-01-15",
      priority: "high"
    },
    {
      id: "L002",
      name: "Maria Garcia",
      company: "Digital Dynamics",
      email: "maria@digitaldynamics.com",
      phone: "+1 (555) 234-5678",
      source: "Social Media",
      status: "contacted",
      value: 8500,
      assignee: "Mike Chen",
      lastContact: "2024-01-14",
      priority: "medium"
    },
    {
      id: "L003",
      name: "David Wilson",
      company: "Growth Partners",
      email: "david@growthpartners.com",
      phone: "+1 (555) 345-6789",
      source: "Referral",
      status: "proposal",
      value: 22000,
      assignee: "Emma Davis",
      lastContact: "2024-01-13",
      priority: "high"
    },
    {
      id: "L004",
      name: "Jennifer Lee",
      company: "StartUp Hub",
      email: "jen@startuphub.com",
      phone: "+1 (555) 456-7890",
      source: "Email Campaign",
      status: "new",
      value: 5000,
      assignee: "John Smith",
      lastContact: "2024-01-12",
      priority: "low"
    },
    {
      id: "L005",
      name: "Robert Brown",
      company: "Enterprise Solutions",
      email: "robert@enterprise.com",
      phone: "+1 (555) 567-8901",
      source: "Cold Call",
      status: "closed",
      value: 18500,
      assignee: "Sarah Johnson",
      lastContact: "2024-01-11",
      priority: "high"
    }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      new: "bg-blue-100 text-blue-800",
      contacted: "bg-yellow-100 text-yellow-800",
      qualified: "bg-purple-100 text-purple-800",
      proposal: "bg-orange-100 text-orange-800",
      closed: "bg-green-100 text-green-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800"
    };
    return colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Recent Leads</h3>
          <p className="text-gray-600">Manage and track your sales pipeline</p>
        </div>
        <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
          Add New Lead
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200">
              <TableHead className="font-semibold text-gray-900">Contact</TableHead>
              <TableHead className="font-semibold text-gray-900">Company</TableHead>
              <TableHead className="font-semibold text-gray-900">Source</TableHea
              <TableHead className="font-semibold text-gray-900">Status</TableHead>
              <TableHead className="font-semibold text-gray-900">Value</TableHead>
              <TableHead className="font-semibold text-gray-900">Assignee</TableHead>
              <TableHead className="font-semibold text-gray-900">Priority</TableHead>
              <TableHead className="font-semibold text-gray-900">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-r from-indigo-400 to-purple-400 text-white text-sm font-medium">
                        {getInitials(lead.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">{lead.name}</p>
                      <p className="text-sm text-gray-600">{lead.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-gray-900">{lead.company}</p>
                    <p className="text-sm text-gray-600">{lead.phone}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-medium">
                    {lead.source}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(lead.status)}>
                    {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-gray-900">
                    ${lead.value.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-gray-900">{lead.assignee}</span>
                </TableCell>
                <TableCell>
                  <Badge className={getPriorityColor(lead.priority)}>
                    {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                      <Mail className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border shadow-lg">
                        <DropdownMenuItem className="gap-2">
                          <Eye className="h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Edit className="h-4 w-4" />
                          Edit Lead
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Showing {leads.length} of {leads.length} leads
        </p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
};
