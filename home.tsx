import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Brain, Target, Clock, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import ResumeUpload from "@/components/resume-upload";
import ParsedResumeData from "@/components/parsed-resume-data";
import JobRecommendations from "@/components/job-recommendations";
import RecommendationInsights from "@/components/recommendation-insights";
import type { UploadProgress } from "@/lib/types";

export default function Home() {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ status: 'idle' });
  const [currentResumeId, setCurrentResumeId] = useState<number | null>(null);

  const handleUploadStatusChange = (progress: UploadProgress) => {
    setUploadProgress(progress);
  };

  const handleResumeUploaded = (resumeId: number) => {
    setCurrentResumeId(resumeId);
  };

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
              <Link href="/applications" className="text-slate-600 hover:text-primary transition-colors">My Applications</Link>
              <Link href="/profile" className="text-slate-600 hover:text-primary transition-colors">Profile</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Resume Upload and Parsed Data */}
          <div className="lg:col-span-1 space-y-6">
            <ResumeUpload 
              onUploadStatusChange={handleUploadStatusChange}
              onResumeUploaded={handleResumeUploaded}
              uploadProgress={uploadProgress}
            />
            
            {currentResumeId && (
              <ParsedResumeData resumeId={currentResumeId} />
            )}
          </div>

          {/* Right Column - Job Recommendations */}
          <div className="lg:col-span-2">
            <JobRecommendations resumeId={currentResumeId} />
          </div>
        </div>

        {/* Recommendation Insights */}
        <RecommendationInsights />
      </main>
    </div>
  );
}
