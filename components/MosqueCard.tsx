'use client'

import { memo, useCallback } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { MapPin, Eye, Pencil, Trash2, UserRound } from 'lucide-react'
import type { Mosque, Worker } from '@/types'

interface MosqueCardProps {
  mosque: Mosque & { workers?: Worker[] }
  onDelete?: (id: number) => void
}

function MosqueCard({ mosque, onDelete }: MosqueCardProps) {
  const workers = mosque.workers || []
  const mosqueRoleWorkers = [
    { id: -1, name: mosque.imam, role: 'إمام' },
    { id: -2, name: mosque.khatib, role: 'خطيب' },
    { id: -3, name: mosque.muezzin, role: 'مؤذن' },
    { id: -4, name: mosque.khadim, role: 'خادم' },
  ].filter((worker) => {
    const name = worker.name?.trim()
    return Boolean(name && name !== '-' && name !== 'ـ' && name !== 'لا يوجد')
  })
  const displayWorkers = workers.length > 0 ? workers : mosqueRoleWorkers
  const workerCount = displayWorkers.length

  const getStatusBadge = useCallback(() => {
    if (mosque.isDestroyed && mosque.isDestroyed !== 'لا يوجد') {
      return { text: 'مهدّم', className: 'bg-purple-100 text-purple-700' }
    }
    if (mosque.isActive) {
      return { text: 'مفعل', className: 'bg-emerald-100 text-emerald-700' }
    }
    if (mosque.state === 'بانتظار الترميم') {
      return { text: 'بانتظار الترميم', className: 'bg-amber-100 text-amber-700' }
    }
    return { text: 'غير مفعل', className: 'bg-gray-100 text-gray-600' }
  }, [mosque.isDestroyed, mosque.isActive, mosque.state])

  const getRoleTone = useCallback((role: string) => {
    if (role.includes('إمام')) return 'bg-blue-50 text-blue-700 border-blue-100'
    if (role.includes('خطيب')) return 'bg-emerald-50 text-emerald-700 border-emerald-100'
    if (role.includes('مؤذن')) return 'bg-amber-50 text-amber-700 border-amber-100'
    if (role.includes('خادم')) return 'bg-rose-50 text-rose-700 border-rose-100'
    return 'bg-gray-50 text-gray-700 border-gray-100'
  }, [])

  const status = getStatusBadge()

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden">
      <div className="bg-gradient-to-br from-primary to-primary-dark p-4 relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center text-primary-dark shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3L2 9v12h20V9L12 3z" />
                <path d="M12 3v18" />
                <path d="M7 9h10" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-white font-bold text-sm truncate">{mosque.name}</h3>
              <p className="text-white/70 text-xs flex items-center gap-1 mt-0.5 min-w-0">
                <MapPin size={10} className="shrink-0" />
                <span className="truncate">{mosque.city} - {mosque.location}</span>
              </p>
            </div>
          </div>
          <span className={cn('px-2 py-1 rounded-full text-[10px] font-bold shrink-0', status.className)}>
            {status.text}
          </span>
        </div>
      </div>

      <div className="p-3">
        {workerCount > 0 ? (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {displayWorkers.slice(0, 6).map((worker) => (
              <div
                key={worker.id}
                className={cn(
                  'min-w-0 rounded-lg border p-2 flex items-center gap-2',
                  getRoleTone(worker.role)
                )}
              >
                <div className="w-7 h-7 rounded-full bg-white/80 flex items-center justify-center shrink-0">
                  <UserRound size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold leading-4 truncate">{worker.name}</p>
                  <p className="text-[10px] leading-4 truncate opacity-80">{worker.role}</p>
                </div>
              </div>
            ))}
            {workerCount > 6 && (
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-2 text-[11px] font-semibold text-gray-500 flex items-center justify-center">
                +{workerCount - 6} عامل
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center py-2 mb-3">لا يوجد عاملين</p>
        )}

        <div className="flex flex-wrap gap-1 mb-2">
          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-purple-50 text-purple-700">
            {mosque.type}
          </span>
          {mosque.friday && (
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700">
              خطبة الجمعة
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-[10px] text-gray-500">{workerCount} عامل</span>
          <div className="flex items-center gap-1">
            <Link
              href={`/mosques/${mosque.id}`}
              className="p-1 text-primary hover:bg-primary/10 rounded-lg transition-colors"
              title="عرض التفاصيل"
            >
              <Eye size={14} />
            </Link>
            <Link
              href={`/mosques/${mosque.id}/edit`}
              className="p-1 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              title="تعديل"
            >
              <Pencil size={14} />
            </Link>
            <button
              onClick={() => onDelete?.(mosque.id)}
              className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="حذف"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(MosqueCard)
