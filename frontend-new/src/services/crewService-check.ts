// Ujistěte se, že máte tuto metodu v crewService.ts:
async getDepartmentsWithPositions(): Promise<DepartmentWithPositions[]> {
  console.log('🌐 Calling /api/crew/departments-with-positions/');
  const response = await api.get<DepartmentWithPositions[]>('/crew/departments-with-positions/');
  console.log('📦 Response:', response.data);
  return response.data;
}
