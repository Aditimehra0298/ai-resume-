import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import type { JobWithRecommendation } from "@shared/schema";
import type { ResumeStats, SearchFilters } from "@/lib/types";

interface JobRecommendationsProps {
  resumeId: number | null;
}

export default function JobRecommendations({ resumeId }: JobRecommendationsProps) {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: "",
    level: "All Levels",
  });
  
  const [displayedJobs, setDisplayedJobs] = useState<JobWithRecommendation[]>([]);
  const [jobsToShow, setJobsToShow] = useState(6);

  // Get recommendations if resumeId is available
  const { data: recommendationsData, isLoading: loadingRecommendations } = useQuery({
    queryKey: ['/api/resumes', resumeId, 'recommendations'],
    enabled: !!resumeId,
  });

  // Search for jobs with filters
  const { data: searchResults, isLoading: loadingSearch } = useQuery({
    queryKey: ['/api/jobs/search', searchFilters.query, searchFilters.level, resumeId],
    enabled: true,
  });

  const isLoading = loadingRecommendations || loadingSearch;
  const stats: ResumeStats = recommendationsData?.statistics || {
    highMatchCount: 0,
    mediumMatchCount: 0,
    totalJobsCount: 0,
  };

  useEffect(() => {
    // Use recommendations if available and no search, otherwise use search results
    const jobsToDisplay = (searchFilters.query || searchFilters.level !== "All Levels") 
      ? searchResults || []
      : recommendationsData?.recommendations || searchResults || [];
    
    setDisplayedJobs(jobsToDisplay.slice(0, jobsToShow));
  }, [recommendationsData, searchResults, searchFilters, jobsToShow]);

  const handleSearch = (query: string) => {
    setSearchFilters(prev => ({ ...prev, query }));
    setJobsToShow(6); // Reset pagination
  };

  const handleLevelFilter = (level: string) => {
    setSearchFilters(prev => ({ ...prev, level }));
    setJobsToShow(6); // Reset pagination
  };

  const handleLoadMore = () => {
    setJobsToShow(prev => prev + 6);
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-orange-100 text-orange-800";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Posted 1 day ago";
    if (diffDays < 7) return `Posted ${diffDays} days ago`;
    if (diffDays < 14) return "Posted 1 week ago";
    return `Posted ${Math.ceil(diffDays / 7)} weeks ago`;
  };

  return (
    <Card>
      {/* Header with Search and Filters */}
      <CardHeader className="border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">Recommended Jobs</h2>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search jobs..."
                value={searchFilters.query}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 text-sm"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            </div>
            <Select value={searchFilters.level} onValueChange={handleLevelFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Levels">All Levels</SelectItem>
                <SelectItem value="Entry">Entry Level</SelectItem>
                <SelectItem value="Mid">Mid Level</SelectItem>
                <SelectItem value="Senior">Senior Level</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Match Statistics */}
        {resumeId && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-xs text-green-600 font-medium">High Match</div>
              <div className="text-lg font-semibold text-green-900">{stats.highMatchCount}</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="text-xs text-yellow-600 font-medium">Medium Match</div>
              <div className="text-lg font-semibold text-yellow-900">{stats.mediumMatchCount}</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-xs text-blue-600 font-medium">Total Jobs</div>
              <div className="text-lg font-semibold text-blue-900">{stats.totalJobsCount}</div>
            </div>
          </div>
        )}
      </CardHeader>

      {/* Job Listings */}
      <CardContent className="p-0">
        {isLoading ? (
          <div className="divide-y divide-slate-200">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-16 w-full" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-18" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : displayedJobs.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-slate-500">
              {resumeId ? "No job recommendations found. Try uploading a resume first." : "No jobs found. Try adjusting your search criteria."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {displayedJobs.map((job) => (
              <div key={job.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
                      {job.matchScore > 0 && (
                        <Badge className={getMatchScoreColor(job.matchScore)}>
                          {job.matchScore}% Match
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-3">
                      {job.company} • {job.location} • {job.type}
                    </p>
                    <p className="text-sm text-slate-700 mb-4">{job.description}</p>

                    {/* Matching Skills */}
                    {job.matchingSkills.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-slate-700 mb-2">Matching Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {job.matchingSkills.map((skill, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-green-100 text-green-800 text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {job.requiredSkills
                            .filter(skill => !job.matchingSkills.includes(skill))
                            .slice(0, 3)
                            .map((skill, index) => (
                              <Badge
                                key={`missing-${index}`}
                                variant="secondary"
                                className="bg-gray-100 text-gray-600 text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <span>{job.salary}</span>
                        <span>{formatDate(job.postedDate)}</span>
                      </div>
                      <Button
                        className={
                          job.matchScore >= 80
                            ? "bg-primary hover:bg-blue-600"
                            : "border border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
                        }
                      >
                        {job.matchScore >= 80 ? "Apply Now" : "View Details"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {!isLoading && displayedJobs.length > 0 && (
          <div className="p-6 border-t border-slate-200 text-center">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              className="px-6 py-2"
            >
              Load More Jobs
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
