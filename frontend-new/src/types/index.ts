// src/types/index.ts

// Utility types
export interface ApiError {
  detail: string;
  code?: string;
  field_errors?: Record<string, string[]>;
}

export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ApiState<T> {
  data: T | null;
  status: ApiStatus;
  error: ApiError | null;
}

export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Auth types - MUSÍ být zde!
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
  avatar?: string;
  created_at: string;
  is_staff?: boolean;
  is_superuser?: boolean;
  role?: string;
}

// Production types
export interface Production {
  id: string;
  title: string;
  description: string;
  status: 'development' | 'pre_production' | 'production' | 'post_production' | 'completed';
  budget_total: number;
  budget_spent: number;
  start_date: string;
  end_date?: string;
  director: string;
  producer: string;
  created_at: string;
  updated_at: string;
}

export interface Scene {
  id: string;
  production: string;
  scene_number: string;
  title: string;
  description: string;
  location: string;
  time_of_day: 'day' | 'night' | 'dawn' | 'dusk';
  estimated_pages: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  script_day: number;
  created_at: string;
  updated_at: string;
}

// Crew types
export interface Department {
  id: string;
  name: string;
  description: string;
  sort_order: number;
}

export interface Position {
  id: string;
  title: string;
  department: Department;
  is_union: boolean;
  base_rate?: number;
}

export interface CrewMember {
  id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  email: string;
  phone_primary: string;
  primary_position: Position;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  created_at: string;
}

export interface CrewAssignment {
  id: string;
  production: string;
  crew_member: CrewMember;
  position: Position;
  start_date: string;
  end_date?: string;
  daily_rate: number;
  status: 'confirmed' | 'pending' | 'tentative' | 'cancelled' | 'completed';
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
