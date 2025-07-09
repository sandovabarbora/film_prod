export const mockCrewMembers = [
  {
    id: '1',
    first_name: 'John',
    last_name: 'Doe',
    display_name: 'John Doe',
    email: 'john.doe@filmproduction.com',
    phone_primary: '+420 123 456 789',
    primary_position: {
      id: '1',
      title: 'Director',
      department: {
        id: '1',
        name: 'Direction'
      }
    },
    emergency_contact_name: 'Jane Doe',
    emergency_contact_phone: '+420 987 654 321',
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    first_name: 'Sarah',
    last_name: 'Johnson',
    display_name: 'Sarah Johnson',
    email: 'sarah.johnson@filmproduction.com',
    phone_primary: '+420 234 567 890',
    primary_position: {
      id: '2',
      title: 'Director of Photography',
      department: {
        id: '2',
        name: 'Camera'
      }
    },
    emergency_contact_name: 'Mike Johnson',
    emergency_contact_phone: '+420 876 543 210',
    created_at: '2024-01-16T09:15:00Z'
  },
  {
    id: '3',
    first_name: 'Michael',
    last_name: 'Chen',
    display_name: 'Michael Chen',
    email: 'michael.chen@filmproduction.com',
    phone_primary: '+420 345 678 901',
    primary_position: {
      id: '3',
      title: 'Sound Mixer',
      department: {
        id: '3',
        name: 'Sound'
      }
    },
    emergency_contact_name: 'Lisa Chen',
    emergency_contact_phone: '+420 765 432 109',
    created_at: '2024-01-17T14:20:00Z'
  },
  {
    id: '4',
    first_name: 'Emma',
    last_name: 'Wilson',
    display_name: 'Emma Wilson',
    email: 'emma.wilson@filmproduction.com',
    phone_primary: '+420 456 789 012',
    primary_position: {
      id: '4',
      title: '1st Assistant Director',
      department: {
        id: '1',
        name: 'Direction'
      }
    },
    emergency_contact_name: 'Tom Wilson',
    emergency_contact_phone: '+420 654 321 098',
    created_at: '2024-01-18T11:45:00Z'
  },
  {
    id: '5',
    first_name: 'David',
    last_name: 'Rodriguez',
    display_name: 'David Rodriguez',
    email: 'david.rodriguez@filmproduction.com',
    phone_primary: '+420 567 890 123',
    primary_position: {
      id: '5',
      title: 'Gaffer',
      department: {
        id: '4',
        name: 'Lighting'
      }
    },
    emergency_contact_name: 'Maria Rodriguez',
    emergency_contact_phone: '+420 543 210 987',
    created_at: '2024-01-19T16:30:00Z'
  }
];

export const mockDepartments = [
  {
    id: '1',
    name: 'Direction',
    description: 'Creative leadership and vision',
    sort_order: 1
  },
  {
    id: '2',
    name: 'Camera',
    description: 'Cinematography and visual capture',
    sort_order: 2
  },
  {
    id: '3',
    name: 'Sound',
    description: 'Audio recording and design',
    sort_order: 3
  },
  {
    id: '4',
    name: 'Lighting',
    description: 'Electrical and lighting setup',
    sort_order: 4
  },
  {
    id: '5',
    name: 'Production',
    description: 'Production management and coordination',
    sort_order: 5
  }
];
