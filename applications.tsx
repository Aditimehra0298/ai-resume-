import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, Calendar, Building, MapPin, Clock } from "lucide-react";
import { Link } from "wouter";

export default function Applications() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Get all jobs to show application history
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['/api/jobs'],
  });

  // Mock application data - in a real app this would come from a dedicated API
  const mockApplications = [
    {
      id: 1,
      jobTitle: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      location: "San Francisco, CA",
      appliedDate: "2024-05-25",
      status: "Interviewing",
      matchScore: 92,
      salary: "$120k - $160k"
    },
    {
      id: 2,
      jobTitle: "Full Stack Developer",
      company: "StartupXYZ",
      location: "Austin, TX",
      appliedDate: "2024-05-23",
      status: "Applied",
      matchScore: 88,
      salary: "$90k - $130k"
    },
    {
      id: 3,
      jobTitle: "React Developer",
      company: "WebFlow Agency",
      location: "Remote",
      appliedDate: "2024-05-20",
      status: "Rejected",
      matchScore: 85,
      salary: "$80k - $110k"
    },
    {
      id: 4,
      jobTitle: "Frontend Developer",
      company: "DesignFirst Studio",
      location: "Los Angeles, CA",
      appliedDate: "2024-05-18",
      status: "Offer",
      matchScore: 79,
      salary: "$65k - $85k"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Applied": return "bg-blue-100 text-blue-800";
      case "Interviewing": return "bg-yellow-100 text-yellow-800";
      case "Offer": return "bg-green-100 text-green-800";
      case "Rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredApplications = mockApplications.filter(app => {
    const matchesSearch = app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="text-white text-sm" />
              </div>
              <h1 className="text-xl font-semibold text-slate-900">Resume Analyzer</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard" className="text-slate-600 hover:text-primary transition-colors">Dashboard</Link>
              <Link href="/applications" className="text-primary font-medium">My Applications</Link>
              <Link href="/profile" className="text-slate-600 hover:text-primary transition-colors">Profile</Link>
              <Link href="/" className="text-slate-600 hover:text-primary transition-colors">Home</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">My Applications</h2>
          <p className="text-slate-600">Track your job applications and their status.</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Applied">Applied</SelectItem>
                  <SelectItem value="Interviewing">Interviewing</SelectItem>
                  <SelectItem value="Offer">Offer</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-slate-900">{mockApplications.length}</div>
              <div className="text-sm text-slate-600">Total Applications</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {mockApplications.filter(app => app.status === "Interviewing").length}
              </div>
              <div className="text-sm text-slate-600">Interviewing</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600">
                {mockApplications.filter(app => app.status === "Offer").length}
              </div>
              <div className="text-sm text-slate-600">Offers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(mockApplications.reduce((sum, app) => sum + app.matchScore, 0) / mockApplications.length)}%
              </div>
              <div className="text-sm text-slate-600">Avg Match Score</div>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        <Card>
          <CardHeader>
            <CardTitle>Application History</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <Building className="mx-auto text-slate-300 mb-4" size={48} />
                <p className="text-slate-500 mb-4">
                  {searchQuery || statusFilter !== "All" ? "No applications match your filters" : "No applications yet"}
                </p>
                <Link href="/">
                  <Button>Find Jobs to Apply</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <div key={application.id} className="border border-slate-200 rounded-lg p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">{application.jobTitle}</h3>
                          <Badge className={getStatusColor(application.status)}>
                            {application.status}
                          </Badge>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {application.matchScore}% Match
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-slate-600 mb-3">
                          <div className="flex items-center space-x-1">
                            <Building size={16} />
                            <span>{application.company}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin size={16} />
                            <span>{application.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar size={16} />
                            <span>Applied {new Date(application.appliedDate).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="text-sm font-medium text-slate-700">
                          {application.salary}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        {application.status === "Applied" && (
                          <Button variant="outline" size="sm">
                            Follow Up
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}