// cv.model.ts
export interface Experience {
  position: string;
  company: string;
  date: string;
  description: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
}

export interface CvData {
  name: string;
  jobTitle: string;
  photo: string;
  email: string;
  phone: string;
  address: string;
  skills: string[];
  hobbies: string[];
  profileDescription: string;
  experiences: Experience[];
  education: Education[];
  language : string[];
  github: string;
  facebook: string;
  linkedin: string;
  instagram: string;
  web: string;
  other1: string;
  other2: string;
  other3: string;
  pdfFiles: { name: string, url: string }[]; // Array to store PDF file details
}
