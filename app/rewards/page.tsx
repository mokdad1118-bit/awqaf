'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Download, Filter, Copy, Upload } from 'lucide-react'
import * as XLSX from 'xlsx'
import { matchesArabic } from '@/lib/arabic-normalize'
import { useAuth } from '@/lib/auth'

interface Reward {
  id: number
  teacherName: string
  region: string
  mosque: string
  amountDue: number
  amountPaid: number
  month: string
  year: number
  notes?: string
  createdAt: string
}

const months = [
  { name: 'يناير', number: 1 },
  { name: 'فبراير', number: 2 },
  { name: 'مارس', number: 3 },
  { name: 'أبريل', number: 4 },
  { name: 'مايو', number: 5 },
  { name: 'يونيو', number: 6 },
  { name: 'يوليو', number: 7 },
  { name: 'أغسطس', number: 8 },
  { name: 'سبتمبر', number: 9 },
  { name: 'أكتوبر', number: 10 },
  { name: 'نوفمبر', number: 11 },
  { name: 'ديسمبر', number: 12 },
]

const baseRewardColumns = [
  'اسم المدرس',
  'المدرس',
  'المنطقة',
  'المنطقه',
  'المسجد',
  'المبلغ المستحق',
  'المستحق',
  'المجموع',
  'الموجوع',
  'المدفوع',
  'الشهر',
  'السنة',
  'العام',
  'ملاحظات',
]

const monthWords: Record<string, number> = {
  يناير: 1,
  كانون: 1,
  فبراير: 2,
  شباط: 2,
  مارس: 3,
  اذار: 3,
  آذار: 3,
  أبريل: 4,
  ابريل: 4,
  نيسان: 4,
  مايو: 5,
  ايار: 5,
  أيار: 5,
  خمسة: 5,
  الخامس: 5,
  يونيو: 6,
  حزيران: 6,
  ستة: 6,
  سته: 6,
  السادس: 6,
  يوليو: 7,
  تموز: 7,
  أغسطس: 8,
  اغسطس: 8,
  آب: 8,
  سبتمبر: 9,
  ايلول: 9,
  أيلول: 9,
  أكتوبر: 10,
  اكتوبر: 10,
  تشرين: 10,
  نوفمبر: 11,
  ديسمبر: 12,
}

const normalizeHeader = (value: string) =>
  value
    .replace(/[إأآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[ً-ْ]/g, '')
    .trim()
    .toLowerCase()

const parseAmount = (value: unknown) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  const normalized = String(value ?? '')
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[٬,]/g, '')
    .trim()
  const amount = Number(normalized)
  return Number.isFinite(amount) ? amount : 0
}

const getMonthName = (monthNumber: number) =>
  months.find((month) => month.number === monthNumber)?.name || ''

const detectMonthNumber = (header: string) => {
  const normalized = normalizeHeader(header)
  const numericMatch = normalized.match(/(?:شهر|لشهر|الشهر)?\s*(1[0-2]|[1-9])(?:\D|$)/)
  if (numericMatch) return Number(numericMatch[1])

  for (const [word, monthNumber] of Object.entries(monthWords)) {
    if (normalized.includes(normalizeHeader(word))) return monthNumber
  }

  return null
}

const isBaseRewardColumn = (header: string) => {
  const normalized = normalizeHeader(header)
  return baseRewardColumns.some((column) => normalized === normalizeHeader(column))
}

export default function RewardsPage() {
  const router = useRouter()
  const { isAdmin, hasPermission } = useAuth()
  const canImport = isAdmin || hasPermission('استيراد البيانات')
  const isLoaded = useRef(false)
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    // Load saved filters from localStorage on mount
    const savedMonth = localStorage.getItem('rewardsFilterMonth')
    const savedYear = localStorage.getItem('rewardsFilterYear')
    const savedSearch = localStorage.getItem('rewardsFilterSearch')
    
    if (savedMonth) setSelectedMonth(savedMonth)
    if (savedYear) setSelectedYear(savedYear)
    else setSelectedYear('2025') // Set default only if no saved value
    if (savedSearch) setSearchQuery(savedSearch)
    
    isLoaded.current = true
    
    // Fetch data after loading filters
    fetchRewards()
  }, [])

  // Save filters to localStorage when user changes them
  const handleMonthChange = (value: string) => {
    setSelectedMonth(value)
    if (isLoaded.current) localStorage.setItem('rewardsFilterMonth', value)
  }

  const handleYearChange = (value: string) => {
    setSelectedYear(value)
    if (isLoaded.current) localStorage.setItem('rewardsFilterYear', value)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (isLoaded.current) localStorage.setItem('rewardsFilterSearch', value)
  }

  // Clear copy data when component mounts to prevent interference
  useEffect(() => {
    localStorage.removeItem('copyRewardData')
  }, [])

  useEffect(() => {
    // Fetch data when filters change
    fetchRewards()
  }, [selectedMonth, selectedYear, searchQuery])

  const fetchRewards = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedMonth) params.append('month', selectedMonth)
      if (selectedYear) params.append('year', selectedYear)
      
      const res = await fetch(`/api/rewards?${params.toString()}`)
      const data = await res.json()
      setRewards(data.data || data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRewards = useMemo(() => {
    if (!searchQuery) return rewards
    const query = searchQuery.toLowerCase()
    return rewards.filter(
      (r) =>
        matchesArabic(query, r.teacherName) ||
        matchesArabic(query, r.mosque)
    )
  }, [rewards, searchQuery])

  const exportToExcel = () => {
    const rows = filteredRewards.map((r) => ({
      'اسم المدرس': r.teacherName,
      'المنطقة': r.region,
      'المسجد': r.mosque,
      'المبلغ المستحق': r.amountDue,
      'الموجوع': r.amountPaid,
      'الشهر': r.month,
      'السنة': r.year,
      'ملاحظات': r.notes || '',
    }))

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'المكافآت')
    XLSX.writeFile(wb, 'rewards.xlsx')
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      let successCount = 0
      let errorCount = 0
      const errors: string[] = []

      for (const row of jsonData) {
        try {
          const teacherName = row['اسم المدرس'] || row['المدرس'] || ''
          const region = row['المنطقة'] || row['المنطقه'] || ''
          const mosque = row['المسجد'] || ''
          const year = Number(row['السنة'] || row['العام'] || selectedYear || new Date().getFullYear())
          const notes = row['ملاحظات'] || ''

          const monthlyRewards = Object.keys(row)
            .filter((header) => !isBaseRewardColumn(header))
            .map((header) => {
              const monthNumber = detectMonthNumber(header)
              const amountDue = parseAmount(row[header])
              if (!monthNumber || amountDue <= 0) return null
              return {
                teacherName,
                region,
                mosque,
                amountDue,
                amountPaid: amountDue,
                month: getMonthName(monthNumber),
                year,
                notes,
              }
            })
            .filter(Boolean) as Omit<Reward, 'id' | 'createdAt'>[]

          const fallbackMonth = row['الشهر'] || ''
          const fallbackAmount = parseAmount(row['المبلغ المستحق'] || row['المستحق'])
          const rewardRows = monthlyRewards.length > 0
            ? monthlyRewards
            : fallbackMonth && fallbackAmount > 0
              ? [{
                  teacherName,
                  region,
                  mosque,
                  amountDue: fallbackAmount,
                  amountPaid: parseAmount(row['المجموع'] || row['الموجوع'] || row['المدفوع']) || fallbackAmount,
                  month: fallbackMonth,
                  year,
                  notes,
                }]
              : []

          if (!teacherName || rewardRows.length === 0) {
            errorCount++
            errors.push(`تم تخطي صف بدون مكافآت: ${teacherName || 'غير معروف'}`)
            continue
          }

          for (const rewardData of rewardRows) {
            const res = await fetch('/api/rewards', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(rewardData),
            })

            if (res.ok) {
              successCount++
            } else {
              errorCount++
              errors.push(`فشل في: ${rewardData.teacherName} - ${rewardData.month}`)
            }
          }
        } catch (error) {
          errorCount++
          errors.push(`خطأ في معالجة الصف`)
        }
      }

      alert(`تم الاستيراد:\n✅ نجح: ${successCount}\n❌ فشل: ${errorCount}`)
      fetchRewards()
    } catch (error) {
      console.error('Error importing:', error)
      alert('حدث خطأ أثناء الاستيراد')
    } finally {
      setImporting(false)
      setShowImportDialog(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا السجل؟')) return
    try {
      await fetch(`/api/rewards/${id}`, { method: 'DELETE' })
      fetchRewards()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleCopy = (reward: Reward) => {
    const copyData = {
      teacherName: reward.teacherName,
      region: reward.region,
      mosque: reward.mosque,
      amountDue: reward.amountDue,
      amountPaid: reward.amountPaid,
      month: reward.month,
      year: reward.year,
      notes: reward.notes || '',
    }
    localStorage.setItem('copyRewardData', JSON.stringify(copyData))
    router.push('/rewards/new')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-primary-dark to-primary text-white p-6">
        <h1 className="text-2xl font-bold">المكافآت الشهرية</h1>
        <p className="text-white/70 mt-1">إدارة مكافآت المدرسين حسب الشهور</p>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-500" />
              <span className="font-semibold text-gray-700">تصفية:</span>
            </div>
            
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="ابحث باسم المدرس أو المسجد..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />

            <select
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">كل الشهور</option>
              {months.map((month) => (
                <option key={month.name} value={month.name}>{month.number} - {month.name}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
              <option value="2029">2029</option>
              <option value="2030">2030</option>
              <option value="2031">2031</option>
            </select>

            <div className="flex-1" />

            <Link
              href="/rewards/new"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              <Plus size={16} />
              <span>إضافة مكافأة</span>
            </Link>

            {canImport && (
              <button
                onClick={() => setShowImportDialog(true)}
                disabled={importing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Upload size={16} />
                <span>{importing ? 'جاري الاستيراد...' : 'استيراد'}</span>
              </button>
            )}

            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-gold text-primary-dark rounded-lg text-sm font-medium hover:bg-gold-light transition-colors"
            >
              <Download size={16} />
              <span>تصدير</span>
            </button>
          </div>

          {canImport && showImportDialog && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">استيراد مكافآت من Excel</h3>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImport}
                  disabled={importing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setShowImportDialog(false)}
                    disabled={importing}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filteredRewards.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>لا توجد سجلات مكافآت</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 z-10 bg-gray-50 shadow-sm">
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 bg-gray-50">اسم المدرس</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 bg-gray-50">المنطقة</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 bg-gray-50">المسجد</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 bg-gray-50">المبلغ المستحق</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 bg-gray-50">المجموع</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 bg-gray-50">الشهر</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 bg-gray-50">السنة</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 bg-gray-50">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRewards.map((reward) => (
                    <tr key={reward.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{reward.teacherName}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{reward.region}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{reward.mosque}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-semibold">{reward.amountDue.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-semibold">{reward.amountPaid.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{reward.month}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{reward.year}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopy(reward)}
                            className="text-primary hover:text-primary-dark text-sm"
                            title="نسخ"
                          >
                            <Copy size={14} />
                          </button>
                          <span className="text-gray-300">|</span>
                          <Link
                            href={`/rewards/${reward.id}/edit`}
                            className="text-amber-600 hover:text-amber-700 text-sm"
                          >
                            تعديل
                          </Link>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handleDelete(reward.id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
