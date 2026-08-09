'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import { Edit, Trash2, Building, Download, RotateCcw, Plus, Upload } from 'lucide-react'
import * as XLSX from 'xlsx'
import type { Worker } from '@/types'
import { useAuth } from '@/lib/auth'
import { matchesArabic } from '@/lib/arabic-normalize'

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importing, setImporting] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState({
    quranMem: '',
    kafala: '',
    education: '',
    status: '',
    evaluation: '',
  })
  const [deletingAll, setDeletingAll] = useState(false)
  const { isAdmin, hasPermission } = useAuth()
  const canImport = isAdmin || hasPermission('استيراد البيانات')

  useEffect(() => {
    fetchWorkers()
  }, [])

  const fetchWorkers = async () => {
    try {
      const res = await fetch('/api/workers?limit=1000')
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
        matchesArabic(query, w.name) ||
        matchesArabic(query, w.role) ||
        matchesArabic(query, w.nationalId) ||
        (w.mosque?.name && matchesArabic(query, w.mosque.name))

      const matchesRole = roleFilter === 'all' || w.role.includes(roleFilter)

      const matchesAdvancedFilters =
        (!advancedFilters.quranMem || w.quranMem === advancedFilters.quranMem) &&
        (!advancedFilters.kafala || w.kafala === advancedFilters.kafala) &&
        (!advancedFilters.education || w.education === advancedFilters.education) &&
        (!advancedFilters.status || w.status === advancedFilters.status) &&
        (!advancedFilters.evaluation || w.evaluation === advancedFilters.evaluation)

      return matchesSearch && matchesRole && matchesAdvancedFilters && isInsideDateRange(w.createdAt)
    })
  }, [workers, searchQuery, roleFilter, dateFrom, dateTo, advancedFilters])

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا العامل؟')) return
    try {
      await fetch(`/api/workers/${id}`, { method: 'DELETE' })
      fetchWorkers()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm('هل أنت متأكد من حذف جميع العاملين؟ هذا الإجراء لا يمكن التراجع عنه!')) return
    if (!confirm('تأكيد نهائي: سيتم حذف جميع العاملين!')) return
    
    setDeletingAll(true)
    try {
      const res = await fetch('/api/workers/delete-all', { method: 'DELETE' })
      if (res.ok) {
        alert('تم حذف جميع العاملين بنجاح')
        fetchWorkers()
      } else {
        alert('فشل حذف جميع العاملين')
      }
    } catch (error) {
      console.error('Error deleting all workers:', error)
      alert('حدث خطأ أثناء حذف جميع العاملين')
    } finally {
      setDeletingAll(false)
    }
  }

  const resetFilters = () => {
    setSearchQuery('')
    setRoleFilter('all')
    setDateFrom('')
    setDateTo('')
    setAdvancedFilters({ quranMem: '', kafala: '', education: '', status: '', evaluation: '' })
  }

  const exportToExcel = () => {
    const rows = filteredWorkers.map((w) => ({
      'الاسم الثلاثي': w.name,
      'الرقم الوطني': w.nationalId,
      'المديرية': w.directorate || '',
      'الشعبة': w.department || '',
      'المكتب': w.office || '',
      'الوضع الوظيفي': w.status,
      'تقييم العامل': w.evaluation,
      'اسم المسجد': w.mosque?.name || '',
      'المدينة/القرية': w.mosque?.city || '',
      'مكانه': w.location || '',
      'طبيعة الكفالة': w.kafala,
      'المسمى الوظيفي': w.role,
      'الشهادة الدراسية': w.education,
      'فئة المسجد': w.mosque?.category || '',
      'المحفوظ من القرآن': w.quranMem,
      'إجمالي الراتب': w.salary,
      'حساب شام كاش': w.shamCashAccount || '',
      'ملاحظات': w.notes || '',
      'تاريخ الإضافة': new Date(w.createdAt).toLocaleDateString('ar-SY'),
    }))

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'العاملين')
    XLSX.writeFile(wb, 'workers-filtered.xlsx')
  }

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canImport) return
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[]

      // Fetch mosques to map mosque names to IDs
      const mosquesRes = await fetch('/api/mosques')
      const mosquesData = await mosquesRes.json()
      const mosques = mosquesData.data || mosquesData
      
      // Create normalized mosque map with fuzzy matching
      const mosqueMap = new Map()
      const mosqueNameVariations = new Map()
      
      mosques.forEach((m: any) => {
        const normalizedName = m.name.trim().toLowerCase()
        mosqueMap.set(normalizedName, m.id)
        
        // Add variations for better matching
        mosqueNameVariations.set(normalizedName.replace(/\s+/g, ''), m.id) // Remove all spaces
        mosqueNameVariations.set(normalizedName.replace(/\d+/g, ''), m.id) // Remove numbers
        mosqueNameVariations.set(normalizedName.replace(/[^\w\s\u0600-\u06FF]/g, ''), m.id) // Remove special chars
      })

      let successCount = 0
      let errorCount = 0
      const errors: string[] = []

      for (const row of jsonData) {
        try {
          const mosqueName = (row['اسم المسجد'] || row['المسجد'] || row['مسجد'] || row['الجامع'] || '').trim()
          let mosqueId = mosqueMap.get(mosqueName.toLowerCase())
          
          // Try fuzzy matching if exact match fails
          if (!mosqueId) {
            const normalizedName = mosqueName.toLowerCase()
            const noSpaces = normalizedName.replace(/\s+/g, '')
            const noNumbers = normalizedName.replace(/\d+/g, '')
            const noSpecial = normalizedName.replace(/[^\w\s\u0600-\u06FF]/g, '')
            
            mosqueId = mosqueNameVariations.get(noSpaces) ||
                       mosqueNameVariations.get(noNumbers) ||
                       mosqueNameVariations.get(noSpecial)
          }

          if (!mosqueId) {
            console.warn(`Mosque not found: "${mosqueName}"`)
            errors.push(`المسجد "${mosqueName}" غير موجود`)
            errorCount++
            continue
          }

          const workerData = {
            name: row['الاسم الثلاثي'] || row['الاسم'] || '',
            nationalId: String(row['الرقم الوطني'] || row['رقم_الوطني'] || ''),
            mosqueId,
            role: row['المسمى الوظيفي'] || row['المسمى'] || row['الوظيفة'] || '',
            education: row['الشهادة الدراسية'] || row['الشهادة'] || row['المؤهل'] || '',
            evaluation: row['تقييم العامل'] || row['التقييم'] || row['التقدير'] || 'وسط',
            quranMem: row['المحفوظ من القرآن'] || row['الحفظ'] || row['القرآن'] || '',
            salary: Number(row['إجمالي الراتب'] || row['الراتب'] || 0),
            salaryUSD: Number(row['الراتب بالدولار'] || row['راتب_دولار'] || 0),
            status: row['الوضع الوظيفي'] || row['الوضع'] || row['الحالة'] || 'نشط',
            kafala: row['طبيعة الكفالة'] || row['الكفالة'] || '',
            notes: row['ملاحظات'] || '',
            directorate: row['المديرية'] || '',
            department: row['الشعبة'] || '',
            office: row['المكتب'] || '',
            location: row['مكانه'] || '',
            shamCashAccount: row['حساب شام كاش'] || '',
          }

          const res = await fetch('/api/workers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workerData),
          })

          if (res.ok) {
            successCount++
          } else {
            const errorData = await res.json()
            console.error('API Error:', errorData)
            errors.push(`${workerData.name}: ${errorData.error || 'خطأ غير معروف'}`)
            errorCount++
          }
        } catch (error) {
          console.error('Error importing row:', row, error)
          errors.push(`${row['الاسم الثلاثي'] || row['الاسم'] || 'غير معروف'}: خطأ في المعالجة`)
          errorCount++
        }
      }

      let summary = `تم الاستيراد بنجاح: ${successCount} عامل\nفشل: ${errorCount} عامل\n\n`
      if (errors.length > 0 && errors.length <= 10) {
        summary += `الأخطاء:\n${errors.join('\n')}`
      } else if (errors.length > 10) {
        summary += `الأخطاء (أول 10):\n${errors.slice(0, 10).join('\n')}\n... و ${errors.length - 10} أخطاء أخرى`
      }
      alert(summary)
      fetchWorkers()
      setShowImportDialog(false)
    } catch (error) {
      console.error('Error importing Excel:', error)
      alert('حدث خطأ أثناء استيراد الملف')
    } finally {
      setImporting(false)
    }
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
                {canImport && (
                  <button
                    onClick={() => setShowImportDialog(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                  >
                    <Upload size={16} />
                    استيراد Excel
                  </button>
                )}
                <button
                  onClick={exportToExcel}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
                >
                  <Download size={16} />
                  تصدير Excel
                </button>
                {(isAdmin || hasPermission('حذف العاملين')) && (
                  <button
                    onClick={handleDeleteAll}
                    disabled={deletingAll}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingAll ? 'جاري الحذف...' : 'حذف الكل'}
                  </button>
                )}
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50"
                  title="إعادة ضبط الفلاتر"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    showAdvancedFilters || Object.values(advancedFilters).some(v => v)
                      ? 'bg-gold text-primary-dark shadow-md'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  فلاتر متقدمة
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`}>
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>
                {showAdvancedFilters && (
                  <div className="absolute top-full right-0 mt-2 bg-white rounded-lg border border-gray-200 shadow-lg p-4 z-50 w-72">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">الحفظ</label>
                        <select
                          value={advancedFilters.quranMem}
                          onChange={(e) => setAdvancedFilters({...advancedFilters, quranMem: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="">الكل</option>
                          <option value="إجازة">إجازة</option>
                          <option value="إجازة بالقراءات العشر">إجازة بالقراءات العشر</option>
                          <option value="1-4 جزء">1-4 جزء</option>
                          <option value="5-10 جزء">5-10 جزء</option>
                          <option value="11-20 جزء">11-20 جزء</option>
                          <option value="21-30 جزء">21-30 جزء</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">الكفالة</label>
                        <select
                          value={advancedFilters.kafala}
                          onChange={(e) => setAdvancedFilters({...advancedFilters, kafala: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="">الكل</option>
                          <option value="كفالة كلية">كفالة كلية</option>
                          <option value="كفالة جزئية">كفالة جزئية</option>
                          <option value="صندوق المسجد أو الجمعيات">صندوق المسجد أو الجمعيات</option>
                          <option value="غير مكفول نهائي">غير مكفول نهائي</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">الشهادة</label>
                        <select
                          value={advancedFilters.education}
                          onChange={(e) => setAdvancedFilters({...advancedFilters, education: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="">الكل</option>
                          <option value="ثانوية عامة">ثانوية عامة</option>
                          <option value="ثانوية شرعية">ثانوية شرعية</option>
                          <option value="إعدادية شرعية">إعدادية شرعية</option>
                          <option value="معهد قرآن">معهد قرآن</option>
                          <option value="جامعة">جامعة</option>
                          <option value="أخرى">أخرى</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">الوضع</label>
                        <select
                          value={advancedFilters.status}
                          onChange={(e) => setAdvancedFilters({...advancedFilters, status: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="">الكل</option>
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">التقييم</label>
                        <select
                          value={advancedFilters.evaluation}
                          onChange={(e) => setAdvancedFilters({...advancedFilters, evaluation: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="">الكل</option>
                          <option value="ممتاز">ممتاز</option>
                          <option value="جيد">جيد</option>
                          <option value="وسط">وسط</option>
                          <option value="ضعيف">ضعيف</option>
                        </select>
                      </div>
                      <button
                        onClick={() => setAdvancedFilters({ quranMem: '', kafala: '', education: '', status: '', evaluation: '' })}
                        className="w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        مسح الفلاتر
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
                      <th className="px-4 py-3 text-right text-sm font-bold">المديرية</th>
                      <th className="px-4 py-3 text-right text-sm font-bold">الشعبة</th>
                      <th className="px-4 py-3 text-right text-sm font-bold">المكتب</th>
                      <th className="px-4 py-3 text-right text-sm font-bold">المسجد</th>
                      <th className="px-4 py-3 text-right text-sm font-bold">المسمى الوظيفي</th>
                      <th className="px-4 py-3 text-right text-sm font-bold">الشهادة</th>
                      <th className="px-4 py-3 text-right text-sm font-bold">الحفظ</th>
                      <th className="px-4 py-3 text-right text-sm font-bold">الكفالة</th>
                      <th className="px-4 py-3 text-right text-sm font-bold">التقييم</th>
                      <th className="px-4 py-3 text-right text-sm font-bold">الراتب</th>
                      <th className="px-4 py-3 text-right text-sm font-bold">حساب شام كاش</th>
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
                        <td className="px-4 py-3 text-sm text-gray-600">{worker.directorate || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{worker.department || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{worker.office || '-'}</td>
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
                        <td className="px-4 py-3 text-sm">{worker.quranMem}</td>
                        <td className="px-4 py-3 text-sm">{worker.kafala}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${getEvalColor(worker.evaluation)}`}>
                            {worker.evaluation}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-primary">{worker.salary.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm">{worker.shamCashAccount || '-'}</td>
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

        {/* Import Dialog */}
        {canImport && showImportDialog && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
              <h3 className="text-lg font-bold text-primary mb-4">استيراد العاملين من Excel</h3>
              <p className="text-sm text-gray-600 mb-4">
                يجب أن يحتوي ملف Excel على الأعمدة التالية:
              </p>
              <ul className="text-xs text-gray-500 mb-4 space-y-1 list-disc list-inside">
                <li>الاسم الثلاثي (أو الاسم)</li>
                <li>الرقم الوطني</li>
                <li>المديرية</li>
                <li>الشعبة</li>
                <li>المكتب</li>
                <li>المسجد (يجب أن يكون موجوداً في النظام)</li>
                <li>المدينة/القرية</li>
                <li>مكانه</li>
                <li>طبيعة الكفالة</li>
                <li>المسمى الوظيفي</li>
                <li>الشهادة الدراسية</li>
                <li>فئة المسجد</li>
                <li>المحفوظ من القرآن</li>
                <li>إجمالي الراتب</li>
                <li>حساب شام كاش</li>
                <li>الوضع الوظيفي</li>
                <li>تقييم العامل</li>
                <li>ملاحظات</li>
              </ul>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImportExcel}
                disabled={importing}
                className="w-full mb-4 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white hover:file:bg-primary-dark"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowImportDialog(false)}
                  disabled={importing}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  إلغاء
                </button>
              </div>
              {importing && (
                <div className="mt-4 text-center text-sm text-gray-500">
                  جاري الاستيراد...
                </div>
              )}
            </div>
          </div>
        )}
    </>
  )
}
