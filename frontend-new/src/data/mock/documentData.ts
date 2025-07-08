// Mock data pro DocumentManager komponenty

export const mockDocuments = [
  {
    id: 'doc-1',
    title: 'Finální scénář - Sunset Dreams',
    filename: 'sunset_dreams_final_v3.2.pdf',
    description: 'Finální verze scénáře po úpravách podle poznámek producenta',
    type: 'script' as const,
    category: 'pre_production' as const,
    status: 'approved' as const,
    version: '3.2',
    size: 2048576, // 2MB
    mimeType: 'application/pdf',
    uploadedBy: 'David Kraus',
    uploadedAt: '2024-11-01T10:00:00Z',
    lastModified: '2024-11-15T14:30:00Z',
    tags: ['scénář', 'finální', 'drama'],
    permissions: {
      canView: ['David Kraus', 'Jana Svobodová', 'Marie Novotná'],
      canEdit: ['David Kraus'],
      canApprove: ['Jana Svobodová']
    },
    versions: [
      {
        id: 'v1.0',
        version: '1.0',
        filename: 'sunset_dreams_draft_v1.0.pdf',
        size: 1843200,
        uploadedBy: 'David Kraus',
        uploadedAt: '2024-10-15T09:00:00Z',
        changeLog: 'První draft scénáře',
        status: 'draft' as const
      },
      {
        id: 'v2.0',
        version: '2.0',
        filename: 'sunset_dreams_revised_v2.0.pdf',
        size: 1945600,
        uploadedBy: 'David Kraus',
        uploadedAt: '2024-10-28T15:45:00Z',
        changeLog: 'Úpravy po první čtené zkoušce',
        status: 'review' as const
      },
      {
        id: 'v3.0',
        version: '3.0',
        filename: 'sunset_dreams_final_v3.0.pdf',
        size: 2015232,
        uploadedBy: 'David Kraus',
        uploadedAt: '2024-11-05T11:20:00Z',
        changeLog: 'Úpravy dialogů a struktura třetího dějství',
        status: 'approved' as const
      },
      {
        id: 'v3.1',
        version: '3.1',
        filename: 'sunset_dreams_final_v3.1.pdf',
        size: 2031616,
        uploadedBy: 'David Kraus',
        uploadedAt: '2024-11-10T13:15:00Z',
        changeLog: 'Drobné úpravy dialogů pro casting',
        status: 'approved' as const
      },
      {
        id: 'v3.2',
        version: '3.2',
        filename: 'sunset_dreams_final_v3.2.pdf',
        size: 2048576,
        uploadedBy: 'David Kraus',
        uploadedAt: '2024-11-15T14:30:00Z',
        changeLog: 'Finální úpravy podle poznámek producenta',
        status: 'final' as const
      }
    ],
    comments: [
      {
        id: 'comment-1',
        author: 'Jana Svobodová',
        content: 'Skvělé vyřešení třetího dějství, dialogy působí mnohem přirozeněji.',
        timestamp: '2024-11-12T16:20:00Z',
        type: 'comment' as const,
        resolved: false
      },
      {
        id: 'comment-2',
        author: 'Marie Novotná',
        content: 'Postavy jsou dobře vykreslené, casting bude jednodušší.',
        timestamp: '2024-11-14T09:45:00Z',
        type: 'comment' as const,
        resolved: false
      },
      {
        id: 'comment-3',
        author: 'Jana Svobodová',
        content: 'Schvaluju finální verzi pro produkci.',
        timestamp: '2024-11-15T14:35:00Z',
        type: 'approval' as const,
        resolved: true
      }
    ],
    relatedTasks: ['task-1'],
    approvalRequired: true,
    approvedBy: 'Jana Svobodová',
    approvedAt: '2024-11-15T14:35:00Z'
  },
  {
    id: 'doc-2',
    title: 'Smlouva s hlavním hercem',
    filename: 'contract_lead_actor_novak.pdf',
    description: 'Smlouva s Petrem Novákem na hlavní roli',
    type: 'contract' as const,
    category: 'legal' as const,
    status: 'final' as const,
    version: '1.0',
    size: 524288, // 512KB
    mimeType: 'application/pdf',
    uploadedBy: 'Marie Novotná',
    uploadedAt: '2024-11-16T11:30:00Z',
    lastModified: '2024-11-16T11:30:00Z',
    tags: ['smlouva', 'herec', 'legal'],
    permissions: {
      canView: ['Marie Novotná', 'Jana Svobodová'],
      canEdit: ['Marie Novotná'],
      canApprove: ['Jana Svobodová']
    },
    versions: [
      {
        id: 'v1.0',
        version: '1.0',
        filename: 'contract_lead_actor_novak.pdf',
        size: 524288,
        uploadedBy: 'Marie Novotná',
        uploadedAt: '2024-11-16T11:30:00Z',
        changeLog: 'Finální podepsaná smlouva',
        status: 'final' as const
      }
    ],
    comments: [],
    relatedTasks: ['task-1'],
    approvalRequired: true,
    approvedBy: 'Jana Svobodová',
    approvedAt: '2024-11-16T11:35:00Z'
  },
  {
    id: 'doc-3',
    title: 'Storyboard - Opening sequence',
    filename: 'storyboard_opening_v2.1.pdf',
    description: 'Vizuální storyboard pro úvodní sekvenci filmu',
    type: 'storyboard' as const,
    category: 'pre_production' as const,
    status: 'review' as const,
    version: '2.1',
    size: 8388608, // 8MB
    mimeType: 'application/pdf',
    uploadedBy: 'Markéta Svobodová',
    uploadedAt: '2024-11-20T15:45:00Z',
    lastModified: '2024-11-22T10:15:00Z',
    tags: ['storyboard', 'opening', 'vizuál'],
    permissions: {
      canView: ['Markéta Svobodová', 'David Kraus', 'Pavel Krejčí'],
      canEdit: ['Markéta Svobodová'],
      canApprove: ['David Kraus']
    },
    versions: [
      {
        id: 'v1.0',
        version: '1.0',
        filename: 'storyboard_opening_v1.0.pdf',
        size: 7340032,
        uploadedBy: 'Markéta Svobodová',
        uploadedAt: '2024-11-18T14:20:00Z',
        changeLog: 'První verze storyboardu',
        status: 'draft' as const
      },
      {
        id: 'v2.0',
        version: '2.0',
        filename: 'storyboard_opening_v2.0.pdf',
        size: 8192000,
        uploadedBy: 'Markéta Svobodová',
        uploadedAt: '2024-11-20T15:45:00Z',
        changeLog: 'Přidané detaily úhlů kamery',
        status: 'review' as const
      },
      {
        id: 'v2.1',
        version: '2.1',
        filename: 'storyboard_opening_v2.1.pdf',
        size: 8388608,
        uploadedBy: 'Markéta Svobodová',
        uploadedAt: '2024-11-22T10:15:00Z',
        changeLog: 'Úprava dle poznámek režiséra',
        status: 'review' as const
      }
    ],
    comments: [
      {
        id: 'comment-4',
        author: 'David Kraus',
        content: 'Úvodní záběr by mohl být širší, aby lépe ukázal prostředí.',
        timestamp: '2024-11-21T14:30:00Z',
        type: 'suggestion' as const,
        resolved: false
      },
      {
        id: 'comment-5',
        author: 'Pavel Krejčí',
        content: 'Z technického hlediska je vše proveditelné.',
        timestamp: '2024-11-22T08:45:00Z',
        type: 'comment' as const,
        resolved: false
      }
    ],
    relatedTasks: ['task-4'],
    approvalRequired: true
  },
  {
    id: 'doc-4',
    title: 'Call Sheet - Den 1',
    filename: 'callsheet_day01_december10.pdf',
    description: 'Harmonogram prvního natáčecího dne',
    type: 'callsheet' as const,
    category: 'production' as const,
    status: 'draft' as const,
    version: '1.0',
    size: 262144, // 256KB
    mimeType: 'application/pdf',
    uploadedBy: 'Tereza Procházková',
    uploadedAt: '2024-12-05T16:00:00Z',
    lastModified: '2024-12-05T16:00:00Z',
    tags: ['callsheet', 'natáčení', 'harmonogram'],
    permissions: {
      canView: ['Tereza Procházková', 'David Kraus', 'Marie Novotná'],
      canEdit: ['Tereza Procházková'],
      canApprove: ['David Kraus']
    },
    versions: [
      {
        id: 'v1.0',
        version: '1.0',
        filename: 'callsheet_day01_december10.pdf',
        size: 262144,
        uploadedBy: 'Tereza Procházková',
        uploadedAt: '2024-12-05T16:00:00Z',
        changeLog: 'První verze call sheet',
        status: 'draft' as const
      }
    ],
    comments: [
      {
        id: 'comment-6',
        author: 'David Kraus',
        content: 'Zkontrolovat časy příjezdu herců podle jejich dostupnosti.',
        timestamp: '2024-12-06T09:15:00Z',
        type: 'suggestion' as const,
        resolved: false
      }
    ],
    relatedTasks: ['task-5'],
    approvalRequired: true
  },
  {
    id: 'doc-5',
    title: 'Koncept kostýmů - hlavní postavy',
    filename: 'costume_concept_main_characters.pdf',
    description: 'Návrhy kostýmů pro hlavní postavy filmu',
    type: 'concept' as const,
    category: 'pre_production' as const,
    status: 'approved' as const,
    version: '1.2',
    size: 4194304, // 4MB
    mimeType: 'application/pdf',
    uploadedBy: 'Petra Kratochvílová',
    uploadedAt: '2024-11-12T13:20:00Z',
    lastModified: '2024-11-18T11:45:00Z',
    tags: ['kostýmy', 'design', 'koncept'],
    permissions: {
      canView: ['Petra Kratochvílová', 'David Kraus', 'Marie Novotná'],
      canEdit: ['Petra Kratochvílová'],
      canApprove: ['David Kraus']
    },
    versions: [
      {
        id: 'v1.0',
        version: '1.0',
        filename: 'costume_concept_v1.0.pdf',
        size: 3670016,
        uploadedBy: 'Petra Kratochvílová',
        uploadedAt: '2024-11-12T13:20:00Z',
        changeLog: 'První návrhy kostýmů',
        status: 'draft' as const
      },
      {
        id: 'v1.1',
        version: '1.1',
        filename: 'costume_concept_v1.1.pdf',
        size: 3932160,
        uploadedBy: 'Petra Kratochvílová',
        uploadedAt: '2024-11-15T10:30:00Z',
        changeLog: 'Úpravy barev podle požadavků režiséra',
        status: 'review' as const
      },
      {
        id: 'v1.2',
        version: '1.2',
        filename: 'costume_concept_main_characters.pdf',
        size: 4194304,
        uploadedBy: 'Petra Kratochvílová',
        uploadedAt: '2024-11-18T11:45:00Z',
        changeLog: 'Finální verze se všemi detaily',
        status: 'approved' as const
      }
    ],
    comments: [
      {
        id: 'comment-7',
        author: 'David Kraus',
        content: 'Skvělá práce! Kostýmy perfektně ladí s charaktery.',
        timestamp: '2024-11-18T12:00:00Z',
        type: 'approval' as const,
        resolved: true
      }
    ],
    relatedTasks: ['task-3'],
    approvalRequired: true,
    approvedBy: 'David Kraus',
    approvedAt: '2024-11-18T12:00:00Z'
  }
];
