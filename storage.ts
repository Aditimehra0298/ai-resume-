import { 
  users, 
  resumes, 
  jobs, 
  jobRecommendations,
  type User, 
  type InsertUser,
  type Resume,
  type InsertResume,
  type Job,
  type InsertJob,
  type JobRecommendation,
  type InsertJobRecommendation,
  type JobWithRecommendation
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createResume(resume: InsertResume): Promise<Resume>;
  getResume(id: number): Promise<Resume | undefined>;
  updateResume(id: number, data: Partial<Resume>): Promise<Resume | undefined>;
  
  createJob(job: InsertJob): Promise<Job>;
  getAllJobs(): Promise<Job[]>;
  getJob(id: number): Promise<Job | undefined>;
  
  createJobRecommendation(recommendation: InsertJobRecommendation): Promise<JobRecommendation>;
  getJobRecommendations(resumeId: number): Promise<JobWithRecommendation[]>;
  deleteJobRecommendations(resumeId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private resumes: Map<number, Resume>;
  private jobs: Map<number, Job>;
  private jobRecommendations: Map<number, JobRecommendation>;
  private currentUserId: number;
  private currentResumeId: number;
  private currentJobId: number;
  private currentRecommendationId: number;

  constructor() {
    this.users = new Map();
    this.resumes = new Map();
    this.jobs = new Map();
    this.jobRecommendations = new Map();
    this.currentUserId = 1;
    this.currentResumeId = 1;
    this.currentJobId = 1;
    this.currentRecommendationId = 1;
    
    this.initializeJobs();
  }

  private initializeJobs() {
    const mockJobs: InsertJob[] = [
      {
        title: "Senior Frontend Developer",
        company: "TechCorp Inc.",
        location: "San Francisco, CA",
        type: "Remote",
        level: "Senior",
        salary: "$120k - $160k",
        description: "Leading frontend development using React, TypeScript, and modern web technologies. Build scalable user interfaces and collaborate with cross-functional teams.",
        requiredSkills: ["React", "TypeScript", "JavaScript", "HTML", "CSS", "Node.js"],
        experienceYears: 5,
      },
      {
        title: "Full Stack Developer",
        company: "StartupXYZ",
        location: "Austin, TX",
        type: "Hybrid",
        level: "Mid",
        salary: "$90k - $130k",
        description: "Build end-to-end web applications using React, Python, and cloud technologies. Work in a fast-paced startup environment with modern development practices.",
        requiredSkills: ["React", "Python", "JavaScript", "AWS", "Docker", "PostgreSQL"],
        experienceYears: 3,
      },
      {
        title: "Backend Engineer",
        company: "DataFlow Solutions",
        location: "Seattle, WA",
        type: "On-site",
        level: "Senior",
        salary: "$110k - $150k",
        description: "Design and implement scalable backend systems using Python, PostgreSQL, and microservices architecture. Experience with data processing pipelines preferred.",
        requiredSkills: ["Python", "PostgreSQL", "SQL", "Docker", "Kubernetes", "Redis"],
        experienceYears: 4,
      },
      {
        title: "React Developer",
        company: "WebFlow Agency",
        location: "Remote",
        type: "Remote",
        level: "Mid",
        salary: "$80k - $110k",
        description: "Create responsive web applications using React and modern JavaScript. Work with designers and product teams to deliver pixel-perfect user experiences.",
        requiredSkills: ["React", "JavaScript", "CSS", "HTML", "Figma", "Git"],
        experienceYears: 3,
      },
      {
        title: "Software Engineer",
        company: "InnovateLabs",
        location: "New York, NY",
        type: "Hybrid",
        level: "Entry",
        salary: "$70k - $95k",
        description: "Join our engineering team to build innovative software solutions. Work with modern technologies and learn from experienced developers.",
        requiredSkills: ["JavaScript", "Python", "Git", "HTML", "CSS", "SQL"],
        experienceYears: 1,
      },
      {
        title: "DevOps Engineer",
        company: "CloudTech Inc.",
        location: "Denver, CO",
        type: "Remote",
        level: "Senior",
        salary: "$130k - $170k",
        description: "Manage cloud infrastructure and deployment pipelines. Work with AWS, Docker, and Kubernetes to ensure scalable and reliable systems.",
        requiredSkills: ["AWS", "Docker", "Kubernetes", "Python", "Terraform", "Jenkins"],
        experienceYears: 5,
      },
      {
        title: "Frontend Developer",
        company: "DesignFirst Studio",
        location: "Los Angeles, CA",
        type: "On-site",
        level: "Entry",
        salary: "$65k - $85k",
        description: "Create beautiful and responsive user interfaces. Work closely with designers to implement modern web applications using React and TypeScript.",
        requiredSkills: ["React", "TypeScript", "CSS", "HTML", "Sass", "JavaScript"],
        experienceYears: 2,
      },
      {
        title: "Machine Learning Engineer",
        company: "AI Innovations",
        location: "Boston, MA",
        type: "Hybrid",
        level: "Senior",
        salary: "$140k - $180k",
        description: "Develop and deploy machine learning models in production. Work with large datasets and modern ML frameworks to solve complex problems.",
        requiredSkills: ["Python", "TensorFlow", "PyTorch", "SQL", "AWS", "Docker"],
        experienceYears: 4,
      }
    ];

    mockJobs.forEach(job => this.createJob(job));
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createResume(insertResume: InsertResume): Promise<Resume> {
    const id = this.currentResumeId++;
    const resume: Resume = {
      ...insertResume,
      id,
      uploadedAt: new Date(),
      processed: false,
      extractedData: null,
    };
    this.resumes.set(id, resume);
    return resume;
  }

  async getResume(id: number): Promise<Resume | undefined> {
    return this.resumes.get(id);
  }

  async updateResume(id: number, data: Partial<Resume>): Promise<Resume | undefined> {
    const resume = this.resumes.get(id);
    if (!resume) return undefined;
    
    const updatedResume = { ...resume, ...data };
    this.resumes.set(id, updatedResume);
    return updatedResume;
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = this.currentJobId++;
    const job: Job = {
      ...insertJob,
      id,
      postedDate: new Date(),
    };
    this.jobs.set(id, job);
    return job;
  }

  async getAllJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values());
  }

  async getJob(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async createJobRecommendation(insertRecommendation: InsertJobRecommendation): Promise<JobRecommendation> {
    const id = this.currentRecommendationId++;
    const recommendation: JobRecommendation = {
      ...insertRecommendation,
      id,
      createdAt: new Date(),
    };
    this.jobRecommendations.set(id, recommendation);
    return recommendation;
  }

  async getJobRecommendations(resumeId: number): Promise<JobWithRecommendation[]> {
    const recommendations = Array.from(this.jobRecommendations.values())
      .filter(rec => rec.resumeId === resumeId)
      .sort((a, b) => b.matchScore - a.matchScore);

    const jobsWithRecommendations: JobWithRecommendation[] = [];
    
    for (const rec of recommendations) {
      const job = this.jobs.get(rec.jobId);
      if (job) {
        jobsWithRecommendations.push({
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          type: job.type,
          level: job.level,
          salary: job.salary,
          description: job.description,
          requiredSkills: job.requiredSkills,
          experienceYears: job.experienceYears,
          postedDate: job.postedDate.toISOString(),
          matchScore: rec.matchScore,
          matchingSkills: rec.matchingSkills,
          reasoning: rec.reasoning,
        });
      }
    }

    return jobsWithRecommendations;
  }

  async deleteJobRecommendations(resumeId: number): Promise<void> {
    const toDelete = Array.from(this.jobRecommendations.entries())
      .filter(([_, rec]) => rec.resumeId === resumeId)
      .map(([id, _]) => id);
    
    toDelete.forEach(id => this.jobRecommendations.delete(id));
  }
}

export const storage = new MemStorage();
