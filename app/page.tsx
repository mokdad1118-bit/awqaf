'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import StatsCards from '@/components/StatsCards'
import MosqueCard from '@/components/MosqueCard'
import { Download, RotateCcw, Plus } from 'lucide-react'
import * as XLSX from 'xlsx'
import type { Mosque } from '@/types'

export default function Home() {
  const [mosques, setMosques] = useState<Mosque[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const fetchMosques = useCallback(async () => {
    try {
      const res = await fetch('/api/mosques?limit=100')
      const data = await res.json()
      setMosques(data.data || data)
    } catch (error) {
      console.error('Error fetching mosques:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMosques()
  }, [fetchMosques])

  const isInsideDateRange = useCallback((value: string) => {
    const created = new Date(value)
    if (Number.isNaN(created.getTime())) return true

    if (dateFrom) {
      const from = new Date(`${dateFrom}T00:00:00`)
      if (created < from) return false
    }

    if (dateTo) {
      const to = new Date(`${dateTo}T23:59:59`)
      if (created > to) return false
    }

    return true
  }, [dateFrom, dateTo])

  const filteredMosques = useMemo(() => {
    const query = searchQuery.trim()

    return mosques.filter((m) => {
      const matchesSearch =
        !query ||
        m.name.includes(query) ||
        m.city.includes(query) ||
        m.location.includes(query) ||
        m.workers?.some((w) => w.name.includes(query) || w.role.includes(query))

      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'active' && m.isActive) ||
        (activeFilter === 'inactive' && !m.isActive) ||
        (activeFilter === 'destroyed' && Boolean(m.isDestroyed && m.isDestroyed !== 'لا يوجد'))

      return matchesSearch && matchesFilter && isInsideDateRange(m.createdAt)
    })
  }, [mosques, searchQuery, activeFilter, isInsideDateRange])

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المسجد؟')) return
    try {
      await fetch(`/api/mosques/${id}`, { method: 'DELETE' })
      fetchMosques()
    } catch (error) {
      console.error('Error deleting mosque:', error)
    }
  }, [fetchMosques])

  const resetFilters = useCallback(() => {
    setSearchQuery('')
    setActiveFilter('all')
    setDateFrom('')
    setDateTo('')
  }, [])

  const exportToExcel = useCallback(() => {
    const rows = filteredMosques.map((m) => ({
      'اسم المسجد': m.name,
      'المدينة': m.city,
      'الموقع': m.location,
      'الفئة': m.category,
      'النوع': m.type,
      'المساحة': m.area ?? '',
      'الحالة الفنية': m.status,
      'التفعيل': m.isActive ? 'مفعل' : 'غير مفعل',
      'الهدم': m.isDestroyed || '',
      'الحالة': m.state,
      'خطبة الجمعة': m.friday ? 'نعم' : 'لا',
      'الملحقات': m.attachments || '',
      'الإمام': m.imam || '',
      'الخطيب': m.khatib || '',
      'المؤذن': m.muezzin || '',
      'الخادم': m.khadim || '',
      'عدد العاملين': m.workers?.length ?? m._count?.workers ?? 0,
      'تاريخ الإضافة': new Date(m.createdAt).toLocaleDateString('ar-SY'),
    }))

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'المساجد')
    XLSX.writeFile(wb, 'mosques-filtered.xlsx')
  }, [filteredMosques])

  const stats = useMemo(() => ({
    mosquesCount: mosques.length,
    workersCount: mosques.reduce((acc, m) => acc + (m._count?.workers || 0), 0),
    activeMosques: mosques.filter((m) => m.isActive).length,
    destroyedMosques: mosques.filter((m) => m.isDestroyed && m.isDestroyed !== 'لا يوجد').length,
  }), [mosques])

  const filters = [
    { key: 'all', label: 'الكل' },
    { key: 'active', label: 'مفعلة' },
    { key: 'inactive', label: 'غير مفعلة' },
    { key: 'destroyed', label: 'مهدمة' },
  ]

  return (
    <>
      <Header onSearch={setSearchQuery} />
        <div className="p-6 space-y-6">
          <StatsCards {...stats} />

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {filters.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setActiveFilter(f.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeFilter === f.key
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/mosques/new"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark"
                >
                  <Plus size={16} />
                  إضافة مسجد
                </Link>
                <button
                  onClick={exportToExcel}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
                >
                  <Download size={16} />
                  تصدير Excel
                </button>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50"
                  title="إعادة ضبط الفلاتر"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <label className="space-y-1">
                <span className="text-xs font-semibold text-gray-600">من تاريخ</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold text-gray-600">إلى تاريخ</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <div className="sm:col-span-2 flex items-end">
                <span className="text-sm text-gray-500">
                  النتائج: <strong className="text-primary">{filteredMosques.length}</strong> مسجد
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="mt-4 text-gray-500">جاري التحميل...</p>
            </div>
          ) : filteredMosques.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">لا توجد نتائج مطابقة</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMosques.map((mosque) => (
                <MosqueCard key={mosque.id} mosque={mosque} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
    </>
  )
}
