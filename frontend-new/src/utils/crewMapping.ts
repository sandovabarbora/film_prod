// src/utils/crewMapping.ts - Mapping utilities for crew data
import type { CrewMember, CrewMemberData } from '../types';

/**
 * Converts frontend form data to backend API format
 */
export const mapFormDataToBackend = (formData: any): CrewMemberData => {
  console.log('🔄 Mapping form data to backend format:', formData);
  
  const backendData: CrewMemberData = {
    first_name: formData.first_name || '',
    last_name: formData.last_name || '',
    preferred_name: formData.preferred_name || '',
    email: formData.email || '',
    phone_primary: formData.phone_primary || formData.phone || '',
    phone_secondary: formData.phone_secondary || '',
    emergency_contact_name: formData.emergency_contact_name || '',
    emergency_contact_phone: formData.emergency_contact_phone || '',
    primary_position_id: formData.primary_position_id || formData.position_id,
    daily_rate: formData.daily_rate ? parseFloat(formData.daily_rate.toString()) : undefined,
    union_member: Boolean(formData.union_member),
    union_number: formData.union_number || '',
    has_vehicle: formData.has_vehicle !== undefined ? Boolean(formData.has_vehicle) : true,
    dietary_restrictions: formData.dietary_restrictions || '',
    shirt_size: formData.shirt_size || '',
    status: formData.status || 'active',
    notes: formData.notes || formData.biography || '',
    available_from: formData.available_from,
    available_to: formData.available_to
  };

  console.log('✅ Mapped backend data:', backendData);
  return backendData;
};

/**
 * Converts backend CrewMember to frontend form format
 */
export const mapBackendToFormData = (member: CrewMember): any => {
  console.log('🔄 Mapping backend data to form format:', member);
  
  const formData = {
    first_name: member.first_name,
    last_name: member.last_name,
    preferred_name: member.preferred_name || '',
    email: member.email,
    phone_primary: member.phone_primary,
    phone: member.phone_primary, // For backwards compatibility
    phone_secondary: member.phone_secondary || '',
    emergency_contact_name: member.emergency_contact_name,
    emergency_contact_phone: member.emergency_contact_phone,
    primary_position_id: member.primary_position?.id,
    position_id: member.primary_position?.id, // For backwards compatibility
    daily_rate: member.daily_rate,
    union_member: member.union_member,
    union_number: member.union_number || '',
    has_vehicle: member.has_vehicle,
    dietary_restrictions: member.dietary_restrictions || '',
    shirt_size: member.shirt_size || '',
    status: member.status,
    notes: member.notes || '',
    biography: member.notes || '', // For backwards compatibility
    available_from: member.available_from,
    available_to: member.available_to
  };

  console.log('✅ Mapped form data:', formData);
  return formData;
};

/**
 * Validates required fields for crew member
 */
export const validateCrewMemberData = (data: Partial<CrewMemberData>): string[] => {
  const errors: string[] = [];
  
  if (!data.first_name?.trim()) {
    errors.push('first_name: First name is required');
  }
  
  if (!data.last_name?.trim()) {
    errors.push('last_name: Last name is required');
  }
  
  if (!data.email?.trim()) {
    errors.push('email: Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('email: Invalid email format');
  }
  
  if (!data.phone_primary?.trim()) {
    errors.push('phone_primary: Primary phone is required');
  }
  
  if (!data.emergency_contact_name?.trim()) {
    errors.push('emergency_contact_name: Emergency contact name is required');
  }
  
  if (!data.emergency_contact_phone?.trim()) {
    errors.push('emergency_contact_phone: Emergency contact phone is required');
  }
  
  return errors;
};
