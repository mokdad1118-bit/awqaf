'use client'

import { Building, Users, Activity, AlertTriangle } from 'lucide-react'

interface StatsCardsProps {
  mosquesCount: number
  workersCount: number
  activeMosques: number
  destroyedMosques: number
}

export default function StatsCards({
  mosquesCount,
  workersCount,
  activeMosques,
  destroyedMosques,
}: StatsCardsProps) {
  const stats = [
    {
      label: 'إجمالي المساجد',
      value: mosquesCount,
      icon: Building,
      color: 'bg-blue-50 text-blue-600',
      border: 'border-blue-200',
    },
    {
      label: 'إجمالي العاملين',
      value: workersCount,
      icon: Users,
      color: 'bg-green-50 text-green-600',
      border: 'border-green-200',
    },
    {
      label: 'المساجد المفعلة',
      value: activeMosques,
      icon: Activity,
      color: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-200',
    },
    {
      label: 'المساجد المهدمة',
      value: destroyedMosques,
      icon: AlertTriangle,
      color: 'bg-red-50 text-red-600',
      border: 'border-red-200',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className={`bg-white rounded-xl p-5 border ${stat.border} shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                <Icon size={24} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
