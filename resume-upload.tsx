import { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CloudUpload, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { UploadProgress } from "@/lib/types";

interface ResumeUploadProps {
  onUploadStatusChange: (progress: UploadProgress) => void;
  onResumeUploaded: (resumeId: number) => void;
  uploadProgress: UploadProgress;
}

export default function ResumeUpload({ 
  onUploadStatusChange, 
  onResumeUploaded, 
  uploadProgress 
}: ResumeUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (file: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOC, or DOCX file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File size must be less than 10MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      onUploadStatusChange({ status: 'uploading' });

      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch('/api/resumes/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      onUploadStatusChange({ status: 'processing' });
      onResumeUploaded(result.resumeId);

      // Poll for processing completion
      pollProcessingStatus(result.resumeId);

      toast({
        title: "Upload successful",
        description: "Your resume is being processed...",
      });

    } catch (error) {
      console.error('Upload error:', error);
      onUploadStatusChange({ 
        status: 'error', 
        error: error.message || 'Upload failed' 
      });
      toast({
        title: "Upload failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  }, [onUploadStatusChange, onResumeUploaded, toast]);

  const pollProcessingStatus = useCallback(async (resumeId: number) => {
    const maxAttempts = 30; // 30 seconds max
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await apiRequest('GET', `/api/resumes/${resumeId}`);
        const data = await response.json();

        if (data.processed) {
          onUploadStatusChange({ status: 'completed' });
          toast({
            title: "Resume processed",
            description: "Job recommendations are now available!",
          });
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 1000); // Poll every second
        } else {
          throw new Error('Processing timeout');
        }
      } catch (error) {
        console.error('Polling error:', error);
        onUploadStatusChange({ 
          status: 'error', 
          error: 'Processing failed' 
        });
      }
    };

    poll();
  }, [onUploadStatusChange, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Upload Resume</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragOver 
                ? 'border-primary bg-blue-50' 
                : uploadProgress.status === 'completed'
                ? 'border-green-300 bg-green-50'
                : 'border-slate-300 hover:border-primary'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <div className="space-y-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
                uploadProgress.status === 'completed' 
                  ? 'bg-green-100' 
                  : 'bg-slate-100'
              }`}>
                {uploadProgress.status === 'completed' ? (
                  <Check className="text-green-500 text-xl" />
                ) : (
                  <CloudUpload className="text-slate-400 text-xl" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {uploadProgress.status === 'completed' 
                    ? 'Resume uploaded successfully!' 
                    : 'Drop your resume here'
                  }
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {uploadProgress.status === 'completed' 
                    ? 'Processing complete'
                    : 'or click to browse'
                  }
                </p>
              </div>
              <p className="text-xs text-slate-400">PDF, DOC, DOCX up to 10MB</p>
            </div>
            <input
              id="file-input"
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              disabled={uploadProgress.status === 'uploading' || uploadProgress.status === 'processing'}
            />
          </div>

          {/* Processing State */}
          {uploadProgress.status === 'processing' && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-blue-900">Processing Resume</p>
                  <p className="text-xs text-blue-700">Analyzing skills and experience...</p>
                </div>
              </div>
            </div>
          )}

          {/* Upload Success */}
          {uploadProgress.status === 'completed' && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Check className="text-green-500" />
                <div>
                  <p className="text-sm font-medium text-green-900">Resume Processed Successfully</p>
                  <p className="text-xs text-green-700">Found recommendations below</p>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {uploadProgress.status === 'error' && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="text-red-500" />
                <div>
                  <p className="text-sm font-medium text-red-900">Upload Failed</p>
                  <p className="text-xs text-red-700">{uploadProgress.error || 'Please try again'}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
