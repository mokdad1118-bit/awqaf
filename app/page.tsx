'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import StatsCards from '@/components/StatsCards'
import MosqueCard from '@/components/MosqueCard'
import { Download, RotateCcw, Plus, Upload } from 'lucide-react'
import * as XLSX from 'xlsx'
import type { Mosque } from '@/types'

export default function Home() {
  const [mosques, setMosques] = useState<Mosque[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importPreview, setImportPreview] = useState<any>(null)
  const [importing, setImporting] = useState(false)
  const [duplicateAction, setDuplicateAction] = useState<'skip' | 'update' | 'create'>('skip')

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

  // Smart column mapping for mosque import
  const columnMapping = {
    name: ['اسم المسجد', 'المسجد', 'اسم الجامع', 'الجامع', 'اسم'],
    city: ['المدينة', 'القرية', 'المدينة/القرية', 'المحافظة', 'المنطقة'],
    location: ['الموقع', 'العنوان', 'المكان', 'المكانة'],
    category: ['الفئة', 'التصنيف', 'درجة'],
    type: ['النوع', 'نوع المسجد', 'تصنيف المسجد'],
    area: ['المساحة', 'المساحة بالمتر'],
    status: ['الحالة الفنية', 'الحالة', 'الوضع'],
    isActive: ['التفعيل', 'مفعل', 'نشط', 'فعال'],
    isDestroyed: ['الهدم', 'مهدم', 'حالة الهدم'],
    state: ['الحالة', 'حالة البناء', 'وضع البناء'],
    friday: ['خطبة الجمعة', 'جمعة', 'صلاة الجمعة'],
    attachments: ['الملحقات', 'الإنشآت', 'المرافق'],
    imam: ['الإمام', 'اسم الإمام', 'إمام المسجد'],
    khatib: ['الخطيب', 'اسم الخطيب', 'خطيب الجمعة'],
    muezzin: ['المؤذن', 'اسم المؤذن'],
    khadim: ['الخادم', 'اسم الخادم', 'الخدم'],
  }

  const findBestMatch = (header: string): string | null => {
    const normalizedHeader = header.toLowerCase().trim()
    for (const [field, variants] of Object.entries(columnMapping)) {
      for (const variant of variants) {
        if (normalizedHeader.includes(variant.toLowerCase()) || variant.toLowerCase().includes(normalizedHeader)) {
          return field
        }
      }
    }
    return null
  }

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[]

      if (jsonData.length === 0) {
        alert('الملف فارغ')
        setImporting(false)
        return
      }

      // Get headers from first row
      const headers = Object.keys(jsonData[0])
      
      // Map columns
      const mappedColumns: any = {}
      const unmappedColumns: string[] = []
      
      headers.forEach(header => {
        const match = findBestMatch(header)
        if (match) {
          mappedColumns[header] = match
        } else {
          unmappedColumns.push(header)
        }
      })

      // Check for required fields
      const requiredFields = ['name', 'city', 'location', 'category', 'type', 'status', 'state']
      const missingFields = requiredFields.filter(field => 
        !Object.values(mappedColumns).includes(field)
      )

      // Detect duplicates
      const existingMosques = mosques
      const duplicates: any[] = []
      const newMosques: any[] = []
      const errors: any[] = []

      jsonData.forEach((row, index) => {
        const nameKey = Object.keys(row).find(k => mappedColumns[k] === 'name')
        const mosqueName = nameKey ? row[nameKey] : row['اسم المسجد'] || row['المسجد'] || ''

        if (!mosqueName) {
          errors.push({ row: index + 1, error: 'اسم المسجد مطلوب' })
          return
        }

        const duplicate = existingMosques.find(m => m.name === mosqueName)
        if (duplicate) {
          duplicates.push({ row: index + 1, mosque: mosqueName, existingId: duplicate.id })
        } else {
          newMosques.push({ row: index + 1, data: row })
        }
      })

      setImportPreview({
        total: jsonData.length,
        new: newMosques.length,
        duplicates: duplicates.length,
        errors: errors.length,
        mappedColumns,
        unmappedColumns,
        missingFields,
        duplicateList: duplicates,
        newMosques,
        errorList: errors,
        jsonData
      })
    } catch (error) {
      console.error('Error reading Excel:', error)
      alert('حدث خطأ أثناء قراءة الملف')
    } finally {
      setImporting(false)
    }
  }

  const confirmImport = async () => {
    if (!importPreview) return

    setImporting(true)
    try {
      let successCount = 0
      let errorCount = 0

      for (const item of importPreview.newMosques) {
        try {
          const row = item.data
          const mapped = importPreview.mappedColumns

          const mosqueData: any = {}
          Object.keys(mapped).forEach(excelHeader => {
            const field = mapped[excelHeader]
            mosqueData[field] = row[excelHeader]
          })

          // Handle boolean fields
          if (mosqueData.isActive) {
            mosqueData.isActive = mosqueData.isActive === 'نعم' || mosqueData.isActive === 'true' || mosqueData.isActive === true
          }
          if (mosqueData.friday) {
            mosqueData.friday = mosqueData.friday === 'نعم' || mosqueData.friday === 'true' || mosqueData.friday === true
          }

          // Handle numeric fields
          if (mosqueData.area) {
            mosqueData.area = Number(mosqueData.area) || null
          }

          // Set defaults for required fields
          mosqueData.isActive = mosqueData.isActive ?? false
          mosqueData.friday = mosqueData.friday ?? false
          
          // Ensure all required fields have values
          mosqueData.name = mosqueData.name || ''
          mosqueData.city = mosqueData.city || ''
          mosqueData.location = mosqueData.location || ''
          mosqueData.category = mosqueData.category || 'أ'
          mosqueData.type = mosqueData.type || 'عام'
          mosqueData.status = mosqueData.status || 'جيدة'
          mosqueData.state = mosqueData.state || 'جاهز'

          const res = await fetch('/api/mosques', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mosqueData),
          })

          if (res.ok) {
            successCount++
          } else {
            errorCount++
          }
        } catch (error) {
          console.error('Error importing row:', item.row, error)
          errorCount++
        }
      }

      // Handle duplicates based on selected action
      if (duplicateAction !== 'skip' && importPreview.duplicateList.length > 0) {
        for (const dup of importPreview.duplicateList) {
          try {
            const row = importPreview.jsonData[dup.row - 1]
            const mapped = importPreview.mappedColumns

            const mosqueData: any = {}
            Object.keys(mapped).forEach(excelHeader => {
              const field = mapped[excelHeader]
              mosqueData[field] = row[excelHeader]
            })

            // Handle boolean fields
            if (mosqueData.isActive) {
              mosqueData.isActive = mosqueData.isActive === 'نعم' || mosqueData.isActive === 'true' || mosqueData.isActive === true
            }
            if (mosqueData.friday) {
              mosqueData.friday = mosqueData.friday === 'نعم' || mosqueData.friday === 'true' || mosqueData.friday === true
            }

            // Handle numeric fields
            if (mosqueData.area) {
              mosqueData.area = Number(mosqueData.area) || null
            }

            // Set defaults for required fields
            mosqueData.isActive = mosqueData.isActive ?? false
            mosqueData.friday = mosqueData.friday ?? false
            
            // Ensure all required fields have values
            mosqueData.name = mosqueData.name || ''
            mosqueData.city = mosqueData.city || ''
            mosqueData.location = mosqueData.location || ''
            mosqueData.category = mosqueData.category || 'أ'
            mosqueData.type = mosqueData.type || 'عام'
            mosqueData.status = mosqueData.status || 'جيدة'
            mosqueData.state = mosqueData.state || 'جاهز'

            if (duplicateAction === 'update') {
              await fetch(`/api/mosques/${dup.existingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mosqueData),
              })
            } else if (duplicateAction === 'create') {
              await fetch('/api/mosques', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mosqueData),
              })
            }
          } catch (error) {
            console.error('Error handling duplicate:', dup.row, error)
          }
        }
      }

      alert(`تم الاستيراد بنجاح:\nجديد: ${successCount}\nخطأ: ${errorCount}`)
      setImportPreview(null)
      setShowImportDialog(false)
      fetchMosques()
    } catch (error) {
      console.error('Error during import:', error)
      alert('حدث خطأ أثناء الاستيراد')
    } finally {
      setImporting(false)
    }
  }

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
                  onClick={() => setShowImportDialog(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                >
                  <Upload size={16} />
                  استيراد Excel
                </button>
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

          {/* Import Dialog */}
          {showImportDialog && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl p-6 max-w-4xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
                {!importPreview ? (
                  <>
                    <h3 className="text-lg font-bold text-primary mb-4">استيراد المساجد من Excel</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      سيقوم النظام بقراءة أسماء الأعمدة تلقائياً ومطابقتها مع الحقول المناسبة
                    </p>
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
                        جاري قراءة الملف...
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-primary mb-4">معاينة الاستيراد</h3>
                    
                    {/* Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{importPreview.total}</div>
                        <div className="text-sm text-gray-600">إجمالي المساجد</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{importPreview.new}</div>
                        <div className="text-sm text-gray-600">جديد</div>
                      </div>
                      <div className="bg-amber-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-amber-600">{importPreview.duplicates}</div>
                        <div className="text-sm text-gray-600">مكرر</div>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{importPreview.errors}</div>
                        <div className="text-sm text-gray-600">أخطاء</div>
                      </div>
                    </div>

                    {/* Column Mapping */}
                    <div className="mb-6">
                      <h4 className="font-bold text-gray-700 mb-3">الأعمدة المحددة</h4>
                      <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                        {Object.entries(importPreview.mappedColumns).map(([excel, field]) => (
                          <div key={excel} className="flex justify-between text-sm py-1 border-b border-gray-200 last:border-0">
                            <span className="text-gray-600">{excel}</span>
                            <span className="font-medium text-primary">→ {String(field)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Unmapped Columns */}
                    {importPreview.unmappedColumns.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-bold text-red-700 mb-3">أعمدة غير معروفة</h4>
                        <div className="bg-red-50 p-4 rounded-lg">
                          {importPreview.unmappedColumns.map((col: string) => (
                            <span key={col} className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded text-xs m-1">
                              {col}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing Fields */}
                    {importPreview.missingFields.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-bold text-amber-700 mb-3">حقول مطلوبة مفقودة</h4>
                        <div className="bg-amber-50 p-4 rounded-lg">
                          {importPreview.missingFields.map((field: string) => (
                            <span key={field} className="inline-block bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs m-1">
                              {field}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Duplicate Action */}
                    {importPreview.duplicates > 0 && (
                      <div className="mb-6">
                        <h4 className="font-bold text-gray-700 mb-3">معالجة المساجد المكررة</h4>
                        <select
                          value={duplicateAction}
                          onChange={(e) => setDuplicateAction(e.target.value as any)}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                        >
                          <option value="skip">تخطي المساجد المكررة</option>
                          <option value="update">تحديث المساجد المكررة</option>
                          <option value="create">إضافة كسجلات جديدة</option>
                        </select>
                      </div>
                    )}

                    {/* Errors */}
                    {importPreview.errorList.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-bold text-red-700 mb-3">الأخطاء</h4>
                        <div className="bg-red-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                          {importPreview.errorList.map((err: any) => (
                            <div key={err.row} className="text-sm text-red-700 py-1 border-b border-red-200">
                              صف {err.row}: {err.error}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setImportPreview(null)
                          setShowImportDialog(false)
                        }}
                        disabled={importing}
                        className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 disabled:opacity-50"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={confirmImport}
                        disabled={importing || importPreview.errors > 0}
                        className="px-6 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-50"
                      >
                        {importing ? 'جاري الاستيراد...' : 'تأكيد واستيراد'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
    </>
  )
}
