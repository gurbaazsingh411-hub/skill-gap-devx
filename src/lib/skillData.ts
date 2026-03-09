export interface RoleSkills {
  role: string;
  required: string[];
  nice: string[];
}

export const roles: RoleSkills[] = [
  {
    role: "Frontend Developer",
    required: ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Git", "Responsive Design", "API Integration", "Testing", "Performance Optimization"],
    nice: ["Next.js", "Tailwind CSS", "Webpack", "GraphQL", "Accessibility", "CI/CD"],
  },
  {
    role: "Backend Developer",
    required: ["Node.js", "Python", "SQL", "REST APIs", "Git", "Authentication", "Database Design", "Testing", "Docker", "Security"],
    nice: ["GraphQL", "Redis", "Message Queues", "Kubernetes", "CI/CD", "Monitoring"],
  },
  {
    role: "Data Analyst",
    required: ["SQL", "Python", "Excel", "Data Visualization", "Statistics", "Pandas", "Tableau", "Data Cleaning", "Reporting", "Critical Thinking"],
    nice: ["R", "Power BI", "A/B Testing", "Machine Learning Basics", "ETL", "Jupyter"],
  },
  {
    role: "Machine Learning Engineer",
    required: ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Statistics", "Linear Algebra", "Data Preprocessing", "Model Deployment", "Git"],
    nice: ["NLP", "Computer Vision", "MLOps", "Docker", "Cloud Platforms", "Spark"],
  },
  {
    role: "Product Manager",
    required: ["Product Strategy", "User Research", "Data Analysis", "Roadmapping", "Stakeholder Management", "Agile", "Wireframing", "A/B Testing", "Communication", "Prioritization"],
    nice: ["SQL", "Figma", "Jira", "Technical Understanding", "Market Analysis", "OKRs"],
  },
  {
    role: "UI/UX Designer",
    required: ["Figma", "User Research", "Wireframing", "Prototyping", "Visual Design", "Typography", "Color Theory", "Usability Testing", "Design Systems", "Responsive Design"],
    nice: ["HTML/CSS", "Motion Design", "Accessibility", "Illustration", "Sketch", "Adobe Creative Suite"],
  },
  {
    role: "Full Stack Developer",
    required: ["HTML", "CSS", "JavaScript", "React", "Node.js", "SQL", "Git", "REST APIs", "TypeScript", "Database Design"],
    nice: ["Docker", "Cloud Platforms", "GraphQL", "CI/CD", "Testing", "DevOps"],
  },
  {
    role: "DevOps Engineer",
    required: ["Linux", "Docker", "Kubernetes", "CI/CD", "Cloud Platforms", "Scripting", "Networking", "Monitoring", "Infrastructure as Code", "Git"],
    nice: ["Terraform", "Ansible", "Security", "Helm", "Service Mesh", "Logging"],
  },
];

export interface AnalysisResult {
  matchedSkills: string[];
  missingSkills: string[];
  partialSkills: { has: string; missing: string }[];
  skillScore: number;
  priorityOrder: string[];
  recommendations: Record<string, string[]>;
}

export const demoResult: AnalysisResult = {
  matchedSkills: ["JavaScript", "React", "HTML", "CSS", "Git"],
  missingSkills: ["TypeScript", "Testing", "Performance Optimization", "API Integration"],
  partialSkills: [
    { has: "CSS", missing: "Responsive Design" },
  ],
  skillScore: 55,
  priorityOrder: ["TypeScript", "API Integration", "Responsive Design", "Testing", "Performance Optimization"],
  recommendations: {
    "TypeScript": ["Official TypeScript Handbook", "Total TypeScript by Matt Pocock", "Build a project with strict TS"],
    "Testing": ["React Testing Library docs", "Jest fundamentals course", "Write tests for an existing project"],
    "Performance Optimization": ["web.dev performance guides", "Chrome DevTools profiling", "Lighthouse audits"],
    "API Integration": ["MDN Fetch API guide", "React Query documentation", "Build a REST-consuming app"],
    "Responsive Design": ["CSS Grid & Flexbox course", "Mobile-first design principles", "Practice with responsive layouts"],
  },
};
