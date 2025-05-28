import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { parseResumeContent, generateJobRecommendations } from "./lib/openai";
import { extractTextFromFile, cleanupFile } from "./lib/fileProcessor";
import { insertResumeSchema } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Upload and parse resume
  app.post("/api/resumes/upload", upload.single('resume'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const file = req.file;
      
      // Validate file data
      const resumeData = {
        fileName: file.filename,
        originalName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
      };

      const validatedData = insertResumeSchema.parse(resumeData);
      
      // Create resume record
      const resume = await storage.createResume(validatedData);
      
      res.json({ 
        success: true, 
        resumeId: resume.id,
        message: "Resume uploaded successfully. Processing will begin shortly."
      });

      // Process the resume asynchronously
      processResumeAsync(resume.id, file.path, file.mimetype);
      
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get resume processing status and extracted data
  app.get("/api/resumes/:id", async (req, res) => {
    try {
      const resumeId = parseInt(req.params.id);
      const resume = await storage.getResume(resumeId);
      
      if (!resume) {
        return res.status(404).json({ error: "Resume not found" });
      }

      res.json({
        id: resume.id,
        processed: resume.processed,
        extractedData: resume.extractedData,
        uploadedAt: resume.uploadedAt,
      });
    } catch (error) {
      console.error("Get resume error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get job recommendations for a resume
  app.get("/api/resumes/:id/recommendations", async (req, res) => {
    try {
      const resumeId = parseInt(req.params.id);
      const resume = await storage.getResume(resumeId);
      
      if (!resume) {
        return res.status(404).json({ error: "Resume not found" });
      }

      if (!resume.processed) {
        return res.status(400).json({ error: "Resume not yet processed" });
      }

      const recommendations = await storage.getJobRecommendations(resumeId);
      
      // Calculate statistics
      const highMatch = recommendations.filter(r => r.matchScore >= 80).length;
      const mediumMatch = recommendations.filter(r => r.matchScore >= 60 && r.matchScore < 80).length;
      const totalJobs = recommendations.length;

      res.json({
        recommendations,
        statistics: {
          highMatchCount: highMatch,
          mediumMatchCount: mediumMatch,
          totalJobsCount: totalJobs,
        }
      });
    } catch (error) {
      console.error("Get recommendations error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Search and filter jobs
  app.get("/api/jobs/search", async (req, res) => {
    try {
      const { query, level, resumeId } = req.query;
      
      let recommendations = [];
      if (resumeId) {
        recommendations = await storage.getJobRecommendations(parseInt(resumeId as string));
      } else {
        // If no resumeId, return all jobs without recommendations
        const allJobs = await storage.getAllJobs();
        recommendations = allJobs.map(job => ({
          ...job,
          postedDate: job.postedDate.toISOString(),
          matchScore: 0,
          matchingSkills: [],
        }));
      }

      // Apply filters
      let filteredJobs = recommendations;

      if (query) {
        const searchTerm = (query as string).toLowerCase();
        filteredJobs = filteredJobs.filter(job => 
          job.title.toLowerCase().includes(searchTerm) ||
          job.company.toLowerCase().includes(searchTerm) ||
          job.description.toLowerCase().includes(searchTerm) ||
          job.requiredSkills.some(skill => skill.toLowerCase().includes(searchTerm))
        );
      }

      if (level && level !== 'All Levels') {
        filteredJobs = filteredJobs.filter(job => job.level === level);
      }

      res.json(filteredJobs);
    } catch (error) {
      console.error("Search jobs error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get all jobs
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getAllJobs();
      const jobsWithStringDates = jobs.map(job => ({
        ...job,
        postedDate: job.postedDate.toISOString(),
      }));
      res.json(jobsWithStringDates);
    } catch (error) {
      console.error("Get jobs error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Async function to process resume
async function processResumeAsync(resumeId: number, filePath: string, mimeType: string) {
  try {
    console.log(`Processing resume ${resumeId}...`);
    
    // Extract text from file
    const resumeText = await extractTextFromFile(filePath, mimeType);
    
    // Parse with OpenAI
    const extractedData = await parseResumeContent(resumeText);
    
    // Update resume with extracted data
    await storage.updateResume(resumeId, {
      processed: true,
      extractedData: extractedData,
    });

    // Generate job recommendations
    const allJobs = await storage.getAllJobs();
    const jobsForMatching = allJobs.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company,
      requiredSkills: job.requiredSkills,
      experienceYears: job.experienceYears,
      description: job.description,
      level: job.level,
    }));

    const recommendations = await generateJobRecommendations(extractedData, jobsForMatching);
    
    // Clear any existing recommendations for this resume
    await storage.deleteJobRecommendations(resumeId);
    
    // Store new recommendations
    for (const rec of recommendations) {
      await storage.createJobRecommendation({
        resumeId,
        jobId: rec.jobId,
        matchScore: rec.matchScore,
        matchingSkills: rec.matchingSkills,
        reasoning: rec.reasoning,
      });
    }

    console.log(`Resume ${resumeId} processed successfully with ${recommendations.length} recommendations`);
    
  } catch (error) {
    console.error(`Error processing resume ${resumeId}:`, error);
    
    // Mark as processed even on error to prevent infinite processing
    await storage.updateResume(resumeId, {
      processed: true,
      extractedData: {
        skills: [],
        experience: "Error processing resume",
        education: "Error processing resume", 
        recentRole: "Error processing resume",
        experienceYears: 0,
        summary: "Error processing resume",
      },
    });
  } finally {
    // Clean up uploaded file
    cleanupFile(filePath);
  }
}
