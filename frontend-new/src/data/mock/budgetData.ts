// Mock data pro BudgetTracker komponenty

export const mockBudgetCategories = [
  {
    id: 'cat-1',
    category: 'Camera & Lighting',
    allocated: 1200000,
    spent: 780000,
    remaining: 420000,
    forecasted: 1150000,
    lastUpdated: '2024-12-15T10:30:00Z',
    status: 'on_track' as const,
    departmentLead: 'Pavel Krejčí',
    transactions: [
      {
        id: 'tx-1',
        date: '2024-12-14T14:20:00Z',
        amount: -45000,
        description: 'RED Camera rental - week 3',
        category: 'Camera & Lighting',
        type: 'expense' as const,
        approvedBy: 'Jana Svobodová',
        invoiceNumber: 'INV-2024-1205'
      },
      {
        id: 'tx-2', 
        date: '2024-12-12T09:15:00Z',
        amount: -28000,
        description: 'LED panel set purchase',
        category: 'Camera & Lighting',
        type: 'expense' as const,
        approvedBy: 'Pavel Krejčí',
        invoiceNumber: 'INV-2024-1198'
      },
      {
        id: 'tx-3',
        date: '2024-12-10T16:45:00Z',
        amount: -15000,
        description: 'Lens filters and accessories',
        category: 'Camera & Lighting',
        type: 'expense' as const,
        approvedBy: 'Pavel Krejčí',
        invoiceNumber: 'INV-2024-1189'
      }
    ]
  },
  {
    id: 'cat-2',
    category: 'Cast & Crew',
    allocated: 1500000,
    spent: 920000,
    remaining: 580000,
    forecasted: 1480000,
    lastUpdated: '2024-12-14T16:15:00Z',
    status: 'warning' as const,
    departmentLead: 'Marie Novotná',
    transactions: [
      {
        id: 'tx-4',
        date: '2024-12-15T08:00:00Z',
        amount: -85000,
        description: 'Hlavní herci - týden 4',
        category: 'Cast & Crew',
        type: 'expense' as const,
        approvedBy: 'Marie Novotná',
        invoiceNumber: 'PAY-2024-0892'
      },
      {
        id: 'tx-5',
        date: '2024-12-13T12:30:00Z',
        amount: -32000,
        description: 'Kostymérka a vizážistka',
        category: 'Cast & Crew',
        type: 'expense' as const,
        approvedBy: 'Marie Novotná',
        invoiceNumber: 'PAY-2024-0887'
      }
    ]
  },
  {
    id: 'cat-3',
    category: 'Locations',
    allocated: 800000,
    spent: 450000,
    remaining: 350000,
    forecasted: 750000,
    lastUpdated: '2024-12-13T11:20:00Z',
    status: 'on_track' as const,
    departmentLead: 'Tomáš Dvořák',
    transactions: [
      {
        id: 'tx-6',
        date: '2024-12-12T14:00:00Z',
        amount: -65000,
        description: 'Pronájem historického zámku - 3 dny',
        category: 'Locations',
        type: 'expense' as const,
        approvedBy: 'Tomáš Dvořák',
        invoiceNumber: 'LOC-2024-0234'
      },
      {
        id: 'tx-7',
        date: '2024-12-08T10:15:00Z',
        amount: -25000,
        description: 'Povolení natáčení - centrum Prahy',
        category: 'Locations',
        type: 'expense' as const,
        approvedBy: 'Tomáš Dvořák',
        invoiceNumber: 'PER-2024-1567'
      }
    ]
  },
  {
    id: 'cat-4',
    category: 'Post Production',
    allocated: 700000,
    spent: 150000,
    remaining: 550000,
    forecasted: 680000,
    lastUpdated: '2024-12-11T09:30:00Z',
    status: 'on_track' as const,
    departmentLead: 'Lukáš Černý',
    transactions: [
      {
        id: 'tx-8',
        date: '2024-12-10T15:20:00Z',
        amount: -38000,
        description: 'DaVinci Resolve Studio license',
        category: 'Post Production',
        type: 'expense' as const,
        approvedBy: 'Lukáš Černý',
        invoiceNumber: 'SW-2024-0445'
      }
    ]
  },
  {
    id: 'cat-5',
    category: 'Equipment',
    allocated: 500000,
    spent: 520000,
    remaining: -20000,
    forecasted: 550000,
    lastUpdated: '2024-12-15T13:45:00Z',
    status: 'critical' as const,
    departmentLead: 'Jan Procházka',
    transactions: [
      {
        id: 'tx-9',
        date: '2024-12-15T11:30:00Z',
        amount: -42000,
        description: 'Náhradní baterie a paměťové karty',
        category: 'Equipment',
        type: 'expense' as const,
        approvedBy: 'Jana Svobodová',
        invoiceNumber: 'EQ-2024-0778'
      },
      {
        id: 'tx-10',
        date: '2024-12-14T16:00:00Z',
        amount: -35000,
        description: 'Dron DJI Mavic 3 - nákup',
        category: 'Equipment',
        type: 'expense' as const,
        approvedBy: 'Jan Procházka',
        invoiceNumber: 'EQ-2024-0775'
      }
    ]
  },
  {
    id: 'cat-6',
    category: 'Catering & Transport',
    allocated: 300000,
    spent: 80000,
    remaining: 220000,
    forecasted: 290000,
    lastUpdated: '2024-12-14T18:00:00Z',
    status: 'on_track' as const,
    departmentLead: 'Hana Svobodová',
    transactions: [
      {
        id: 'tx-11',
        date: '2024-12-14T17:45:00Z',
        amount: -18000,
        description: 'Catering pro štáb - týden 4',
        category: 'Catering & Transport',
        type: 'expense' as const,
        approvedBy: 'Hana Svobodová',
        invoiceNumber: 'CAT-2024-0156'
      },
      {
        id: 'tx-12',
        date: '2024-12-13T07:30:00Z',
        amount: -12000,
        description: 'Doprava techniky na lokaci',
        category: 'Catering & Transport',
        type: 'expense' as const,
        approvedBy: 'Hana Svobodová',
        invoiceNumber: 'TRA-2024-0089'
      }
    ]
  }
];

export const mockBudgetSummary = {
  total: 5000000,
  allocated: 5000000,
  spent: 2900000,
  remaining: 2100000,
  categories: mockBudgetCategories,
  lastUpdated: '2024-12-15T18:30:00Z'
};
