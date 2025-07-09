// Partial update for crewService.ts - enhanced updateCrewMember method
import apiClient, { type PaginatedResponse, DetailedApiError } from './apiClient';

// Replace the existing updateCrewMember method with this enhanced version:
async updateCrewMember(id: string, data: CrewMemberData): Promise<CrewMember> {
  try {
    console.log(`👥 Updating crew member ${id}:`, data);
    
    // Log the exact data being sent
    console.log('📤 Crew update payload:', JSON.stringify(data, null, 2));
    console.log('🎯 Update endpoint:', `/crew/members/${id}/`);
    
    const response = await apiClient.patch<CrewMember>(`/crew/members/${id}/`, data);
    
    console.log('✅ Crew member updated successfully:', response);
    return response;
    
  } catch (error) {
    console.error(`❌ Failed to update crew member ${id}:`, error);
    
    if (error instanceof DetailedApiError) {
      console.error('🔍 Detailed validation errors:', {
        status: error.status,
        message: error.message,
        fieldErrors: error.details,
        rawData: error.rawData,
        url: error.response?.url
      });

      // Provide helpful debugging info
      if (error.details.length > 0) {
        console.error('📋 Field-specific errors:');
        error.details.forEach(detail => {
          console.error(`  • ${detail.field}: ${detail.message}`);
        });
      }
    }
    
    throw error;
  }
}
