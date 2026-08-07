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
  const [deletingAll, setDeletingAll] = useState(false)

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

  const handleDeleteAll = async () => {
    if (!confirm('هل أنت متأكد من حذف جميع المساجد والعاملين؟ هذا الإجراء لا يمكن التراجع عنه!')) return
    if (!confirm('تأكيد نهائي: سيتم حذف جميع البيانات!')) return
    
    setDeletingAll(true)
    try {
      const res = await fetch('/api/mosques/delete-all', { method: 'DELETE' })
      if (res.ok) {
        alert('تم حذف جميع المساجد بنجاح')
        fetchMosques()
      } else {
        alert('حدث خطأ أثناء الحذف')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('حدث خطأ أثناء الحذف')
    } finally {
      setDeletingAll(false)
    }
  }

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

  // Smart column mapping for mosque import - comprehensive
  const columnMapping = {
    name: ['اسم المسجد', 'المسجد', 'اسم الجامع', 'الجامع', 'اسم_المسجد'],
    city: ['المدينة', 'القرية', 'المدينة/القرية', 'المحافظة', 'المنطقة', 'المدينة_القرية'],
    location: ['الموقع', 'العنوان', 'المكان', 'المكانة', 'العنوان_الكامل', 'مكانه', 'المكانة'],
    category: ['الفئة', 'التصنيف', 'درجة', 'فئة_المسجد', 'فئته'],
    type: ['النوع', 'نوع المسجد', 'تصنيف المسجد', 'نوع_المسجد', 'نوعه'],
    area: ['المساحة', 'المساحة بالمتر', 'المساحة_بالمتر', 'مساحة', 'مساحته'],
    status: ['الحالة الفنية', 'الحالة', 'الوضع', 'الحالة_الفنية', 'حالته الفنية'],
    isActive: ['التفعيل', 'مفعل', 'نشط', 'فعال', 'حالة_التفعيل', 'مفعل/غير مفعل'],
    isDestroyed: ['الهدم', 'مهدم', 'حالة الهدم', 'حالة_الهدم', 'نسبة الهدم', 'مهدم كلياً/مهدم جزئياً'],
    state: ['الحالة', 'حالة البناء', 'وضع البناء', 'حالة_البناء', 'حالته', 'حالة المسجد', 'حالته البناء', 'وضع البناء', 'حالة_المسجد'],
    friday: ['خطبة الجمعة', 'جمعة', 'صلاة الجمعة', 'خطبة_الجمعة', 'تقام فيه خطبة الجمعة'],
    attachments: ['الملحقات', 'الإنشآت', 'المرافق', 'الملحقات_الإنشائية', 'ملحقات المسجد'],
    imam: ['الإمام', 'اسم الإمام', 'إمام المسجد', 'اسم_الإمام', 'اسم الإمام الثلاثي', 'اسم الإمام المعاون'],
    khatib: ['الخطيب', 'اسم الخطيب', 'خطيب الجمعة', 'اسم_الخطيب', 'اسم الخطيب الثلاثي'],
    muezzin: ['المؤذن', 'اسم المؤذن', 'اسم_المؤذن', 'اسم المؤذن الثلاثي'],
    khadim: ['الخادم', 'اسم الخادم', 'الخدم', 'اسم_الخادم', 'اسم الخادم الثلاثي'],
    directorate: ['المديرية'],
    department: ['الشعبة'],
    office: ['المكتب'],
  }

  const findBestMatch = (header: string): string | null => {
    const normalizedHeader = header.toLowerCase().trim()
    let bestMatch: string | null = null
    let bestScore = 0
    
    for (const [field, variants] of Object.entries(columnMapping)) {
      for (const variant of variants) {
        const normalizedVariant = variant.toLowerCase().trim()
        
        // Exact match gets highest score
        if (normalizedHeader === normalizedVariant) {
          return field
        }
        
        // Check if header contains variant or vice versa
        if (normalizedHeader.includes(normalizedVariant) || normalizedVariant.includes(normalizedHeader)) {
          // Score based on length of match (longer matches are better)
          const score = Math.min(normalizedHeader.length, normalizedVariant.length)
          if (score > bestScore) {
            bestScore = score
            bestMatch = field
          }
        }
      }
    }
    
    return bestMatch
  }

  // Extract worker data from mosque row
  const extractWorkerData = (row: any, mosqueId: number): any[] => {
    const workers: any[] = []
    
    // Check for worker columns in various formats
    const workerFields = [
      { name: 'إمام', role: 'إمام', key: 'imam' },
      { name: 'خطيب', role: 'خطيب', key: 'khatib' },
      { name: 'مؤذن', role: 'مؤذن', key: 'muezzin' },
      { name: 'خادم', role: 'خادم', key: 'khadim' },
    ]
    
    workerFields.forEach(field => {
      const workerName = row[field.name] || row[field.key] || ''
      if (workerName && typeof workerName === 'string' && workerName.trim()) {
        const nationalId = String(row['الرقم الوطني ' + field.name] || row['رقم_وطني_' + field.key] || '').trim()
        
        // Validate national ID format (basic validation)
        if (nationalId && nationalId.length < 5) {
          console.warn(`Invalid national ID for ${field.name}: ${nationalId}`)
        }
        
        workers.push({
          name: workerName.trim(),
          nationalId: nationalId || '000000000000', // Fallback if missing
          mosqueId,
          role: field.role,
          education: (row['الشهادة ' + field.name] || row['شهادة_' + field.key] || '').trim(),
          evaluation: (row['التقييم ' + field.name] || row['تقييم_' + field.key] || 'وسط').trim(),
          quranMem: (row['الحفظ ' + field.name] || row['حفظ_' + field.key] || '').trim(),
          salary: Number(row['الراتب ' + field.name] || row['راتب_' + field.key] || 0),
          salaryUSD: Number(row['الراتب بالدولار ' + field.name] || row['راتب_دولار_' + field.key] || 0),
          status: (row['الوضع ' + field.name] || row['وضع_' + field.key] || 'قائم على رأس عمله').trim(),
          kafala: (row['الكفالة ' + field.name] || row['كفالة_' + field.key] || '').trim(),
          notes: (row['ملاحظات ' + field.name] || row['ملاحظات_' + field.key] || '').trim(),
          directorate: (row['المديرية ' + field.name] || row['مديرية_' + field.key] || '').trim(),
          department: (row['الشعبة ' + field.name] || row['شعبة_' + field.key] || '').trim(),
          office: (row['المكتب ' + field.name] || row['مكتب_' + field.key] || '').trim(),
          location: (row['المكان ' + field.name] || row['مكان_' + field.key] || '').trim(),
          shamCashAccount: (row['حساب شام كاش ' + field.name] || row['حساب_شام_كاش_' + field.key] || '').trim(),
        })
      }
    })
    
    return workers
  }

  // Validate mosque data
  const validateMosqueData = (data: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    if (!data.name || data.name.trim().length === 0) {
      errors.push('اسم المسجد مطلوب')
    }
    
    if (!data.city || data.city.trim().length === 0) {
      errors.push('المدينة مطلوبة')
    }
    
    if (!data.location || data.location.trim().length === 0) {
      errors.push('الموقع مطلوب')
    }
    
    const validCategories = ['أ', 'ب', 'ج', 'د']
    if (data.category && !validCategories.includes(data.category)) {
      errors.push(`الفئة يجب أن تكون واحدة من: ${validCategories.join(', ')}`)
    }
    
    const validTypes = ['عام', 'مركزي', 'عام أثري', 'مركزي أثري']
    if (data.type && !validTypes.includes(data.type)) {
      errors.push(`النوع يجب أن يكون واحداً من: ${validTypes.join(', ')}`)
    }
    
    const validStatuses = ['ممتازة', 'جيدة', 'متوسطة', 'ضعيفة', 'ضعيفة جداً']
    if (data.status && !validStatuses.includes(data.status)) {
      errors.push(`الحالة الفنية يجب أن تكون واحدة من: ${validStatuses.join(', ')}`)
    }
    
    const validStates = ['جاهز', 'بانتظار الترميم', 'قيد الترميم', 'تم ترميمه', 'قيد البناء', 'تم بناؤه']
    if (data.state && !validStates.includes(data.state)) {
      errors.push(`حالة البناء يجب أن تكون واحدة من: ${validStates.join(', ')}`)
    }
    
    if (data.area && (isNaN(data.area) || data.area < 0)) {
      errors.push('المساحة يجب أن تكون رقماً موجباً')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  // Fix validation errors automatically
  const fixValidationErrors = (data: any, errors: string[]): any | null => {
    const fixed: any = {}
    let hasFixes = false
    
    errors.forEach(error => {
      if (error.includes('الفئة')) {
        // Try to match category with fuzzy matching
        const categoryMap: Record<string, string> = {
          'ا': 'أ', 'a': 'أ', 'أولى': 'أ', 'الأولى': 'أ',
          'ب': 'ب', 'ثانية': 'ب', 'الثانية': 'ب',
          'ج': 'ج', 'ثالثة': 'ج', 'الثالثة': 'ج',
          'د': 'د', 'رابعة': 'د', 'الرابعة': 'د',
        }
        const normalized = data.category?.toLowerCase().trim()
        if (normalized && categoryMap[normalized]) {
          fixed.category = categoryMap[normalized]
          hasFixes = true
        } else {
          fixed.category = 'أ' // Default
          hasFixes = true
        }
      }
      
      if (error.includes('النوع')) {
        // Try to match type with fuzzy matching
        const typeMap: Record<string, string> = {
          'عام': 'عام',
          'مركزي': 'مركزي',
          'اثري': 'عام أثري', 'أثري': 'عام أثري', 'عام اثري': 'عام أثري',
          'مركزي اثري': 'مركزي أثري', 'مركزي أثري': 'مركزي أثري',
        }
        const normalized = data.type?.toLowerCase().trim()
        if (normalized && typeMap[normalized]) {
          fixed.type = typeMap[normalized]
          hasFixes = true
        } else {
          fixed.type = 'عام' // Default
          hasFixes = true
        }
      }
      
      if (error.includes('الحالة الفنية')) {
        // Try to match status with fuzzy matching
        const statusMap: Record<string, string> = {
          'ممتاز': 'ممتازة', 'ممتازة': 'ممتازة',
          'جيد': 'جيدة', 'جيدة': 'جيدة',
          'متوسط': 'متوسطة', 'متوسطة': 'متوسطة',
          'ضعيف': 'ضعيفة', 'ضعيفة': 'ضعيفة',
          'ضعيف جدا': 'ضعيفة جداً', 'ضعيفة جدا': 'ضعيفة جداً', 'ضعيفة جداً': 'ضعيفة جداً',
        }
        const normalized = data.status?.toLowerCase().trim()
        if (normalized && statusMap[normalized]) {
          fixed.status = statusMap[normalized]
          hasFixes = true
        } else {
          fixed.status = 'جيدة' // Default
          hasFixes = true
        }
      }
      
      if (error.includes('حالة البناء')) {
        // Try to match state with fuzzy matching
        const stateMap: Record<string, string> = {
          'جاهز': 'جاهز',
          'انتظار': 'بانتظار الترميم', 'بانتظار': 'بانتظار الترميم',
          'قيد': 'قيد الترميم', 'قيد الترميم': 'قيد الترميم',
          'تم ترميمه': 'تم ترميمه',
          'قيد بناء': 'قيد البناء', 'قيد البناء': 'قيد البناء',
          'تم بناؤه': 'تم بناؤه',
        }
        const normalized = data.state?.toLowerCase().trim()
        if (normalized && stateMap[normalized]) {
          fixed.state = stateMap[normalized]
          hasFixes = true
        } else {
          fixed.state = 'جاهز' // Default
          hasFixes = true
        }
      }
      
      if (error.includes('المساحة')) {
        fixed.area = 0 // Default
        hasFixes = true
      }
    })
    
    return hasFixes ? fixed : null
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
      
      // Get range to handle merged cells properly
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
      const jsonData: any[] = []
      
      // Read each row manually to handle merged cells
      for (let row = range.s.r; row <= range.e.r; row++) {
        const rowData: any = {}
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
          const cell = worksheet[cellAddress]
          const headerRow = 0 // Assuming headers are in first row
          const headerAddress = XLSX.utils.encode_cell({ r: headerRow, c: col })
          const headerCell = worksheet[headerAddress]
          
          if (headerCell && headerCell.v) {
            const header = String(headerCell.v).trim()
            const value = cell ? (cell.v || '') : ''
            rowData[header] = value
          }
        }
        if (Object.keys(rowData).length > 0) {
          jsonData.push(rowData)
        }
      }
      
      // Remove header row from data
      if (jsonData.length > 0) {
        jsonData.shift()
      }

      if (jsonData.length === 0) {
        alert('الملف فارغ')
        setImporting(false)
        return
      }

      // Get headers from first data row
      const headers = Object.keys(jsonData[0] || {})
      
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
      const requiredFields = ['name', 'city', 'location']
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
        const mosqueName = nameKey ? String(row[nameKey] || '').trim() : String(row['اسم المسجد'] || row['المسجد'] || '').trim()

        if (!mosqueName || mosqueName.length === 0) {
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
          
          // Ensure all required fields have values with trim
          mosqueData.name = (mosqueData.name || '').trim()
          mosqueData.city = (mosqueData.city || '').trim()
          mosqueData.location = (mosqueData.location || '').trim()
          mosqueData.category = (mosqueData.category || 'أ').trim()
          mosqueData.type = (mosqueData.type || 'عام').trim()
          mosqueData.status = (mosqueData.status || 'جيدة').trim()
          mosqueData.state = (mosqueData.state || 'جاهز').trim()
          
          // Trim all string fields
          if (mosqueData.imam) mosqueData.imam = mosqueData.imam.trim()
          if (mosqueData.khatib) mosqueData.khatib = mosqueData.khatib.trim()
          if (mosqueData.muezzin) mosqueData.muezzin = mosqueData.muezzin.trim()
          if (mosqueData.khadim) mosqueData.khadim = mosqueData.khadim.trim()
          if (mosqueData.attachments) mosqueData.attachments = mosqueData.attachments.trim()
          if (mosqueData.isDestroyed) mosqueData.isDestroyed = mosqueData.isDestroyed.trim()

          // Validate mosque data
          const validation = validateMosqueData(mosqueData)
          if (!validation.valid) {
            console.error(`Validation errors for row ${item.row}:`, validation.errors.join(', '))
            // Try to fix validation errors instead of rejecting
            const fixedData = fixValidationErrors(mosqueData, validation.errors)
            if (fixedData) {
              Object.assign(mosqueData, fixedData)
              console.log(`Fixed validation errors for row ${item.row}`)
            } else {
              errorCount++
              continue
            }
          }

          const res = await fetch('/api/mosques', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mosqueData),
          })

          if (res.ok) {
            const createdMosque = await res.json()
            successCount++
            
            // Import workers for this mosque if worker data exists
            const workerData = extractWorkerData(row, createdMosque.id)
            if (workerData && workerData.length > 0) {
              for (const worker of workerData) {
                try {
                  const workerRes = await fetch('/api/workers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(worker),
                  })
                  if (workerRes.ok) {
                    console.log('Worker imported successfully')
                  } else {
                    console.error('Failed to import worker:', worker)
                  }
                } catch (error) {
                  console.error('Error importing worker:', error)
                }
              }
            }
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
            
            // Ensure all required fields have values with trim
            mosqueData.name = (mosqueData.name || '').trim()
            mosqueData.city = (mosqueData.city || '').trim()
            mosqueData.location = (mosqueData.location || '').trim()
            mosqueData.category = (mosqueData.category || 'أ').trim()
            mosqueData.type = (mosqueData.type || 'عام').trim()
            mosqueData.status = (mosqueData.status || 'جيدة').trim()
            mosqueData.state = (mosqueData.state || 'جاهز').trim()
            
            // Trim all string fields
            if (mosqueData.imam) mosqueData.imam = mosqueData.imam.trim()
            if (mosqueData.khatib) mosqueData.khatib = mosqueData.khatib.trim()
            if (mosqueData.muezzin) mosqueData.muezzin = mosqueData.muezzin.trim()
            if (mosqueData.khadim) mosqueData.khadim = mosqueData.khadim.trim()
            if (mosqueData.attachments) mosqueData.attachments = mosqueData.attachments.trim()
            if (mosqueData.isDestroyed) mosqueData.isDestroyed = mosqueData.isDestroyed.trim()

            // Validate mosque data
            const validation = validateMosqueData(mosqueData)
            if (!validation.valid) {
              console.error(`Validation errors for duplicate row ${dup.row}:`, validation.errors)
              // Try to fix validation errors instead of rejecting
              const fixedData = fixValidationErrors(mosqueData, validation.errors)
              if (fixedData) {
                Object.assign(mosqueData, fixedData)
              } else {
                continue
              }
            }

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
                  onClick={handleDeleteAll}
                  disabled={deletingAll}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingAll ? 'جاري الحذف...' : 'حذف الكل'}
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
                        disabled={importing}
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
