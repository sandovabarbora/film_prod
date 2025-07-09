// src/types/crew.ts

// Main interfaces
export interface CrewMember {
  id: string;
  first_name: string;
  last_name: string;
  preferred_name?: string;
  email: string;
  phone_primary: string;
  phone_secondary?: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  
  // Professional info
  primary_position?: Position;
  secondary_positions?: Position[];
  daily_rate?: number;
  union_member: boolean;
  union_number?: string;
  
  // Logistics
  has_vehicle: boolean;
  dietary_restrictions?: string;
  shirt_size?: string;
  
  // Availability
  available_from?: string; // ISO date string
  available_to?: string;
  
  // Status
  status: 'active' | 'on_hold' | 'unavailable' | 'blacklisted';
  notes?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Computed fields
  display_name?: string;
  full_name?: string;
  
  // For list view
  primary_position_title?: string;
  department?: string;
  current_assignments?: CrewAssignment[];
}

export interface CrewMemberFormData {
  first_name: string;
  last_name: string;
  preferred_name?: string;
  email: string;
  phone_primary: string;
  phone_secondary?: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  primary_position_id?: string;
  daily_rate?: number | string; // Form může posílat string
  union_member?: boolean;
  union_number?: string;
  has_vehicle?: boolean;
  dietary_restrictions?: string;
  shirt_size?: ShirtSize;
  available_from?: string;
  available_to?: string;
  notes?: string;
}

export interface Department {
  id: number;
  name: string;
  abbreviation: string;
  color_code: string;
  sort_order: number;
  positions?: Position[];
  positions_count?: number;
}

export interface Position {
  id: string;
  title: string;
  department: Department;
  department_name?: string;
  level: PositionLevel;
  daily_rate_min?: number;
  daily_rate_max?: number;
  requires_certification: boolean;
}

export interface DepartmentWithPositions {
  id: number;
  name: string;
  abbreviation: string;
  color_code: string;
  positions: {
    id: string;
    title: string;
    level: PositionLevel;
    daily_rate_min: number | null;
    daily_rate_max: number | null;
  }[];
}

export interface CrewAssignment {
  id: string;
  production: string;
  crew_member: CrewMember | string;
  position: Position | string;
  
  // Contract details
  start_date: string;
  end_date?: string;
  daily_rate: number;
  guaranteed_days: number;
  
  // Status
  status: 'confirmed' | 'pending' | 'tentative' | 'cancelled' | 'completed';
  
  // Permissions
  can_view_schedule: boolean;
  can_view_script: boolean;
  can_view_budget: boolean;
  is_department_head: boolean;
  
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // For list view
  crew_member_name?: string;
  production_title?: string;
  position_title?: string;
  department?: string;
}

export interface CallSheet {
  id: string;
  production: string;
  shooting_day: number;
  date: string;
  
  // General info
  general_call_time: string;
  shooting_call?: string;
  base_camp_location?: string;
  nearest_hospital?: string;
  parking_instructions?: string;
  
  // Weather
  weather_forecast?: string;
  sunrise?: string;
  sunset?: string;
  
  // Status
  status: 'draft' | 'final' | 'cancelled';
  approved_by?: string;
  approved_at?: string;
  
  // Meta
  created_at: string;
  updated_at: string;
  
  // For list view
  production_title?: string;
  crew_count?: number;
  crew_calls?: CrewCall[];
}

export interface CrewCall {
  id: string;
  call_sheet: string;
  crew_member: CrewMember | string;
  call_time: string;
  status: 'called' | 'confirmed' | 'declined' | 'no_response';
  confirmed: boolean;
  report_to?: string;
  transport_provided: boolean;
  notes?: string;
  
  // For display
  crew_member_name?: string;
}

export interface Character {
  id: string;
  production: string;
  name: string;
  description?: string;
  actor?: CrewMember;
  
  // Character type
  is_principal: boolean;
  is_supporting: boolean;
  is_background: boolean;
  
  // Scene info
  total_scenes?: number;
  first_appearance?: string;
  last_appearance?: string;
  
  // Wardrobe
  costume_notes?: string;
  makeup_notes?: string;
  
  created_at: string;
  updated_at: string;
  
  // For display
  actor_name?: string;
}

export type PositionLevel = 'hod' | 'key' | 'assistant' | 'trainee' | 'other';

export type ShirtSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';

export type CrewStatus = 'active' | 'on_hold' | 'unavailable' | 'blacklisted';

export type AssignmentStatus = 'confirmed' | 'pending' | 'tentative' | 'cancelled' | 'completed';

export interface CrewFormErrors {
  first_name?: string[];
  last_name?: string[];
  email?: string[];
  phone_primary?: string[];
  emergency_contact_name?: string[];
  emergency_contact_phone?: string[];
  daily_rate?: string[];
  available_from?: string[];
  available_to?: string[];
  non_field_errors?: string[];
}

// For API responses that might be paginated
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// For availability checking
export interface AvailabilityCheck {
  start_date: string;
  end_date: string;
  position_id?: string;
  department_id?: string;
}

export interface AvailabilityResult {
  available: Array<{
    crew_member: CrewMember;
    conflicts: CrewAssignment[];
  }>;
  unavailable: Array<{
    crew_member: CrewMember;
    conflicts: CrewAssignment[];
  }>;
  total_available: number;
  total_unavailable: number;
}

// For bulk import
export interface BulkImportResult {
  imported: number;
  updated: number;
  errors: string[];
  total_processed: number;
}