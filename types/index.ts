export interface Mosque {
  id: number
  name: string
  city: string
  location: string
  category: string
  type: string
  area: number | null
  status: string
  isActive: boolean
  isDestroyed: string | null
  state: string
  friday: boolean
  attachments: string | null
  imam: string | null
  khatib: string | null
  muezzin: string | null
  khadim: string | null
  createdAt: string
  updatedAt: string
  workers?: Worker[]
  _count?: { workers: number }
}

export interface Worker {
  id: number
  name: string
  nationalId: string
  mosqueId: number
  mosque?: Mosque
  role: string
  education: string
  evaluation: string
  quranMem: string
  salary: number
  salaryUSD: number
  status: string
  kafala: string
  notes: string | null
  createdAt: string
  updatedAt: string
}
