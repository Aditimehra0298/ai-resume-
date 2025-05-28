import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { ExtractedResumeData } from "@shared/schema";

interface ParsedResumeDataProps {
  resumeId: number;
}

export default function ParsedResumeData({ resumeId }: ParsedResumeDataProps) {
  const { data: resumeData, isLoading, error } = useQuery({
    queryKey: ['/api/resumes', resumeId],
    enabled: !!resumeId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Extracted Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Skeleton className="h-4 w-16 mb-2" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !resumeData?.processed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Extracted Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            {error ? "Error loading resume data" : "Resume not yet processed"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const extractedData = resumeData.extractedData as ExtractedResumeData;

  if (!extractedData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Extracted Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">No data extracted from resume</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Extracted Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Skills Section */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-2">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {extractedData.skills.length > 0 ? (
              extractedData.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                  {skill}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-slate-500">No skills extracted</p>
            )}
          </div>
        </div>

        {/* Experience */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-2">Experience</h4>
          <p className="text-sm text-slate-600">
            {extractedData.experience || "No experience information found"}
          </p>
        </div>

        {/* Education */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-2">Education</h4>
          <p className="text-sm text-slate-600">
            {extractedData.education || "No education information found"}
          </p>
        </div>

        {/* Recent Role */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-2">Most Recent Role</h4>
          <p className="text-sm text-slate-600">
            {extractedData.recentRole || "No recent role found"}
          </p>
        </div>

        {/* Years of Experience */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-2">Experience Level</h4>
          <p className="text-sm text-slate-600">
            {extractedData.experienceYears} years of experience
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
