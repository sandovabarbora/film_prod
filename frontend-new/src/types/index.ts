// src/types/index.ts - Unified types for API consistency

// Main Project type pro films/productions API
export interface Project {
  id: string;
  title: string;
  description?: string;
  status: 'development' | 'pre_production' | 'production' | 'post_production' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string;
  budget: number;
  location_primary: string;
  director?: string;
  producer?: string;
  scenes_count?: number;
  completion_percentage?: number;
  created_at?: string;
  updated_at?: string;
}

// Crew Member types
export interface CrewMember {
  id: string | number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  biography?: string;
  is_active: boolean;
  primary_position?: CrewPosition;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  created_at: string;
  updated_at?: string;
}

export interface CrewPosition {
  id: number;
  title: string;
  department: CrewDepartment;
  responsibilities?: string;
  is_head_of_department: boolean;
  hierarchy_level: number;
}

export interface CrewDepartment {
  id: number;
  name: string;
  description?: string;
  color_code?: string;
}

// CrewAssignment - pro API compatibility
export interface CrewAssignment {
  id: string | number;
  crew_member: string | CrewMember;
  production?: string;
  position?: string;
  role?: string;
  start_date: string;
  end_date?: string;
  daily_rate: number;
  status?: string;
  notes?: string;
  is_key_personnel?: boolean;
}

// API Response types
export interface ProjectsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Project[];
}

export interface CrewResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CrewMember[];
}

// Schedule types
export interface ShootingDay {
  id: string;
  production: string;
  date: string;
  call_time: string;
  estimated_wrap: string;
  location: string;
  notes: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scenes: Scene[];
}

export interface Scene {
  id: string;
  scene_number: string;
  title: string;
  description: string;
  location: string;
  time_of_day: 'day' | 'night' | 'dawn' | 'dusk';
  status: 'planned' | 'shooting' | 'completed' | 'cancelled';
}

// Form data types
export interface CrewMemberData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  biography?: string;
  position_id?: number;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

// Film/Media types
export interface Film {
  id: string;
  title: string;
  description: string;
  poster_url?: string;
  genre: string;
  duration?: number;
  status: 'planning' | 'production' | 'post_production' | 'completed';
  created_at: string;
  updated_at: string;
}
