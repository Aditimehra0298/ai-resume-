import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, TrendingUp, Target, Users, Clock, Download } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  // Get all resumes
  const { data: resumes, isLoading: loadingResumes } = useQuery({
    queryKey: ['/api/resumes'],
  });

  // Get all jobs for stats
  const { data: jobs } = useQuery({
    queryKey: ['/api/jobs'],
  });

  const stats = [
    {
      title: "Resumes Uploaded",
      value: resumes?.length || 0,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Job Matches",
      value: jobs?.length || 0,
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "High Match Jobs",
      value: "12", // This would be calculated from actual recommendations
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Applications Sent",
      value: "5",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

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
              <Link href="/dashboard" className="text-primary font-medium">Dashboard</Link>
              <Link href="/applications" className="text-slate-600 hover:text-primary transition-colors">My Applications</Link>
              <Link href="/profile" className="text-slate-600 hover:text-primary transition-colors">Profile</Link>
              <Link href="/" className="text-slate-600 hover:text-primary transition-colors">Home</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome back!</h2>
          <p className="text-slate-600">Here's an overview of your job search activity.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                      <Icon className={`${stat.color}`} size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Resumes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Resumes</CardTitle>
              <Link href="/">
                <Button variant="outline" size="sm">Upload New</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loadingResumes ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-slate-200 rounded mb-2"></div>
                      <div className="h-3 bg-slate-100 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : resumes && resumes.length > 0 ? (
                <div className="space-y-4">
                  {resumes.slice(0, 5).map((resume: any) => (
                    <div key={resume.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="text-slate-400" size={20} />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{resume.originalName}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(resume.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={resume.processed ? "default" : "secondary"}>
                          {resume.processed ? "Processed" : "Processing"}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Download size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto text-slate-300 mb-4" size={48} />
                  <p className="text-slate-500 mb-4">No resumes uploaded yet</p>
                  <Link href="/">
                    <Button>Upload Your First Resume</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Resume processed successfully</p>
                    <p className="text-xs text-slate-500">Found 8 matching jobs</p>
                    <p className="text-xs text-slate-400">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">New job recommendations available</p>
                    <p className="text-xs text-slate-500">5 high-match positions found</p>
                    <p className="text-xs text-slate-400">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Application submitted</p>
                    <p className="text-xs text-slate-500">Senior Frontend Developer at TechCorp</p>
                    <p className="text-xs text-slate-400">3 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/">
                <Button className="w-full h-20 flex-col space-y-2">
                  <FileText size={24} />
                  <span>Upload Resume</span>
                </Button>
              </Link>
              <Link href="/applications">
                <Button variant="outline" className="w-full h-20 flex-col space-y-2">
                  <Target size={24} />
                  <span>View Applications</span>
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" className="w-full h-20 flex-col space-y-2">
                  <Users size={24} />
                  <span>Update Profile</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}