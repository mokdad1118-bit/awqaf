'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import { Edit, Trash2, Building, Download, RotateCcw, Plus } from 'lucide-react'
import * as XLSX from 'xlsx'
import type { Worker } from '@/types'

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    fetchWorkers()
  }, [])

  const fetchWorkers = async () => {
    try {
      const res = await fetch('/api/workers?limit=100')
      const data = await res.json()
      setWorkers(data.data || data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const isInsideDateRange = (value: string) => {
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
  }

  const filteredWorkers = useMemo(() => {
    const query = searchQuery.trim()

    return workers.filter((w) => {
      const matchesSearch =
        !query ||
        w.name.includes(query) ||
        w.role.includes(query) ||
        w.nationalId.includes(query) ||
        w.mosque?.name.includes(query)

      const matchesRole = roleFilter === 'all' || w.role.includes(roleFilter)
      const matchesStatus = statusFilter === 'all' || w.status === statusFilter

      return matchesSearch && matchesRole && matchesStatus && isInsideDateRange(w.createdAt)
    })
  }, [workers, searchQuery, roleFilter, statusFilter, dateFrom, dateTo])

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا العامل؟')) return
    try {
      await fetch(`/api/workers/${id}`, { method: 'DELETE' })
      fetchWorkers()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const resetFilters = () => {
    setSearchQuery('')
    setRoleFilter('all')
    setStatusFilter('all')
    setDateFrom('')
    setDateTo('')
  }

  const exportToExcel = () => {
    const rows = filteredWorkers.map((w) => ({
      'الاسم الثلاثي': w.name,
      'الرقم الوطني': w.nationalId,
      'المسجد': w.mosque?.name || '',
      'المسمى الوظيفي': w.role,
      'الشهادة': w.education,
      'التقييم': w.evaluation,
      'الحفظ': w.quranMem,
      'الراتب': w.salary,
      'الراتب بالدولار': w.salaryUSD,
      'الوضع': w.status,
      'الكفالة': w.kafala,
      'ملاحظات': w.notes || '',
      'تاريخ الإضافة': new Date(w.createdAt).toLocaleDateString('ar-SY'),
    }))

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'العاملين')
    XLSX.writeFile(wb, 'workers-filtered.xlsx')
  }

  const getRoleColor = (role: string) => {
    if (role.includes('إمام') && role.includes('خطيب')) return 'bg-purple-100 text-purple-700'
    if (role === 'إمام') return 'bg-blue-100 text-blue-700'
    if (role === 'خطيب') return 'bg-emerald-100 text-emerald-700'
    if (role.includes('مؤذن')) return 'bg-amber-100 text-amber-700'
    if (role === 'خادم') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-700'
  }

  const getEvalColor = (eval_: string) => {
    const colors: Record<string, string> = {
      ممتاز: 'bg-emerald-100 text-emerald-700',
      جيد: 'bg-blue-100 text-blue-700',
      وسط: 'bg-amber-100 text-amber-700',
      ضعيف: 'bg-red-100 text-red-700',
    }
    return colors[eval_] || 'bg-gray-100 text-gray-700'
  }

  const roles = ['إمام', 'خطيب', 'مؤذن', 'خادم']
  const statuses = Array.from(new Set(workers.map((w) => w.status).filter(Boolean)))

  return (
    <>
      <Header onSearch={setSearchQuery} />
        <div className="p-6 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-primary">قائمة العاملين</h2>
                <p className="text-sm text-gray-500">{filteredWorkers.length} عامل</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/workers/new"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark"
                >
                  <Plus size={16} />
                  إضافة عامل
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <label className="space-y-1">
                <span className="text-xs font-semibold text-gray-600">المسمى الوظيفي</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">كل المسميات</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold text-gray-600">الوضع</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">كل الأوضاع</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
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
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-primary text-white">
                      <th className="px-4 py-3 text-right text-sm font-bold">#</th>
                      <th className="px-4 py-3 text-right text-sm font-bold">الاسم الثلاثي</th>
                      <th className="px-4 py-3 text-right text-sm font-bold">الرقم الوطني</th>
                      <th className="px-4 py-3 text-right text-sm font-bold">المسجد</th>
                      <th className="px-4 py-3 text-right text-sm font-bold">المسمى الوظيفي</th>
                      <th className="px-4 py-3 text-right text-sm font-bold">الشهادة</th>
                      <th className="px-4 py-3 text-right text-sm font-bold">التقييم</th>
                      <th className="px-4 py-3 text-right text-sm font-bold">الحفظ</th>
                      <th className="px-4 py-3 text-right text-sm font-bold">الراتب</th>
                      <th className="px-4 py-3 text-right text-sm font-bold">الوضع</th>
                      <th className="px-4 py-3 text-right text-sm font-bold">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWorkers.map((worker, index) => (
                      <tr key={worker.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                        <td className="px-4 py-3 text-sm font-bold text-primary-dark">{worker.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{worker.nationalId}</td>
                        <td className="px-4 py-3 text-sm">
                          <Link href={`/mosques/${worker.mosqueId}`} className="flex items-center gap-1 text-primary hover:underline">
                            <Building size={12} />
                            {worker.mosque?.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${getRoleColor(worker.role)}`}>
                            {worker.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{worker.education}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${getEvalColor(worker.evaluation)}`}>
                            {worker.evaluation}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{worker.quranMem}</td>
                        <td className="px-4 py-3 text-sm font-bold text-primary">{worker.salary.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm">{worker.status}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Link href={`/workers/${worker.id}/edit`} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="تعديل">
                              <Edit size={14} />
                            </Link>
                            <button onClick={() => handleDelete(worker.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredWorkers.length === 0 && (
                  <div className="py-12 text-center text-gray-400">لا توجد نتائج مطابقة</div>
                )}
              </div>
            )}
          </div>
        </div>
    </>
  )
}
