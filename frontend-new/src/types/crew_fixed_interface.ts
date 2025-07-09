// Fixed CrewMemberData interface to match Django backend
export interface CrewMemberData {
  first_name: string;
  last_name: string;
  preferred_name?: string;
  email: string;
  phone_primary: string;           // FIXED: používá backend field name
  phone_secondary?: string;
  emergency_contact_name: string;  // POVINNÉ
  emergency_contact_phone: string; // POVINNÉ
  primary_position_id?: string;
  daily_rate?: number;
  union_member?: boolean;
  union_number?: string;
  has_vehicle?: boolean;
  dietary_restrictions?: string;
  shirt_size?: string;
  status?: 'active' | 'on_hold' | 'unavailable' | 'blacklisted';
  notes?: string;                  // FIXED: notes místo biography
  available_from?: string;
  available_to?: string;
}

// Alternativní interface pro backwards compatibility
export interface CrewMemberFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;                  // Frontend může používat zkrácený název
  phone_primary?: string;          // Nebo plný backend název
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  position_id?: string;
  biography?: string;              // Frontend může používat biography
  notes?: string;                  // Backend používá notes
  daily_rate?: number | string;
}
