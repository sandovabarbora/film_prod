// src/types/project.ts - Legacy project types (deprecated - use types/index.ts)
// This file is kept for backward compatibility only
// All new types should go to types/index.ts

export interface LegacyProject {
  id: string;
  title: string;
  description: string;
  status: 'development' | 'pre_production' | 'production' | 'post_production' | 'completed' | 'on_hold' | 'cancelled';
  type: 'feature' | 'documentary' | 'short' | 'commercial' | 'series' | 'music_video';
  genre: string[];
  director: string;
  producer: string;
  writer?: string;
  budget: {
    total: number;
    used: number;
    remaining: number;
    currency: string;
  };
  timeline: {
    startDate: string;
    endDate: string;
    currentPhase: string;
    milestones: Milestone[];
  };
  progress: {
    overall: number;
    preProduction: number;
    production: number;
    postProduction: number;
  };
  team: {
    total: number;
    active: number;
    roles: TeamMember[];
  };
  scenes: {
    total: number;
    completed: number;
    inProgress: number;
    planned: number;
  };
  locations: Location[];
  equipment: Equipment[];
  documents: Document[];
  tags: string[];
  poster?: string;
  trailer?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  visibility: 'private' | 'team' | 'public';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  notes?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  department: string;
  joinedAt: string;
  status: 'active' | 'inactive' | 'pending';
  permissions: string[];
}

export interface Location {
  id: string;
  name: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  type: 'interior' | 'exterior' | 'studio';
  availability: string[];
  cost?: number;
  contacts: Contact[];
  notes?: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: 'camera' | 'lens' | 'lighting' | 'audio' | 'grip' | 'other';
  model?: string;
  serialNumber?: string;
  status: 'available' | 'in_use' | 'maintenance' | 'damaged';
  assignedTo?: string;
  cost?: number;
  notes?: string;
}

export interface Document {
  id: string;
  title: string;
  type: 'script' | 'storyboard' | 'schedule' | 'budget' | 'contract' | 'other';
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
  version?: string;
  tags: string[];
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
}
