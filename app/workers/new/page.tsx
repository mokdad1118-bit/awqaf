'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Save } from 'lucide-react'
import type { Mosque } from '@/types'

function AddWorkerForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedMosqueId = searchParams.get('mosqueId')

  const [loading, setLoading] = useState(false)
  const [mosques, setMosques] = useState<Mosque[]>([])
  const [formData, setFormData] = useState({
    name: '',
    nationalId: '',
    mosqueId: preselectedMosqueId || '',
    role: 'خطيب',
    education: 'لا يوجد شهادة',
    evaluation: 'جيد',
    quranMem: '1-4 جزء',
    salary: '',
    salaryUSD: '0',
    status: 'قائم على رأس عمله',
    kafala: 'كفالة كلية',
    notes: '',
  })

  useEffect(() => {
    fetchMosques()
  }, [])

  const fetchMosques = async () => {
    try {
      const res = await fetch('/api/mosques')
      const data = await res.json()
      setMosques(Array.isArray(data) ? data : (data.data || []))
    } catch (error) {
      console.error('Error:', error)
      setMosques([])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          mosqueId: parseInt(formData.mosqueId),
          salary: parseInt(formData.salary) || 0,
          salaryUSD: parseInt(formData.salaryUSD) || 0,
        }),
      })
      if (res.ok) {
        router.push('/')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
  const labelClass = "block text-sm font-bold text-primary mb-1.5"

  return (
    <>
      <div className="bg-gradient-to-br from-primary-dark to-primary text-white p-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
              <ArrowRight size={20} />
            </Link>
            <h1 className="text-2xl font-bold">إضافة عامل جديد</h1>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>الاسم الثلاثي *</label>
                <input name="name" value={formData.name} onChange={handleChange} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>الرقم الوطني *</label>
                <input name="nationalId" value={formData.nationalId} onChange={handleChange} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>المسجد *</label>
                <select name="mosqueId" value={formData.mosqueId} onChange={handleChange} required className={inputClass}>
                  <option value="">اختر المسجد</option>
                  {mosques.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} — {m.city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>المسمى الوظيفي</label>
                <select name="role" value={formData.role} onChange={handleChange} className={inputClass}>
                  <option value="خطيب">خطيب</option>
                  <option value="إمام">إمام</option>
                  <option value="إمام وخطيب">إمام وخطيب</option>
                  <option value="إمام ومؤذن">إمام ومؤذن</option>
                  <option value="إمام وخطيب ومؤذن">إمام وخطيب ومؤذن</option>
                  <option value="إمام وخطيب ومؤذن وخادم">إمام وخطيب ومؤذن وخادم</option>
                  <option value="إمام وخادم">إمام وخادم</option>
                  <option value="خطيب ومؤذن">خطيب ومؤذن</option>
                  <option value="مؤذن">مؤذن</option>
                  <option value="خادم">خادم</option>
                  <option value="مؤذن وخادم">مؤذن وخادم</option>
                  <option value="إمام ومؤذن وخادم">إمام ومؤذن وخادم</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>الشهادة الدراسية</label>
                <select name="education" value={formData.education} onChange={handleChange} className={inputClass}>
                  <option value="دكتوراه">دكتوراه</option>
                  <option value="ماجستير">ماجستير</option>
                  <option value="إجازة في الشريعة">إجازة في الشريعة</option>
                  <option value="إجازة عامة">إجازة عامة</option>
                  <option value="معهد متوسط شرعي">معهد متوسط شرعي</option>
                  <option value="معهد متوسط عام">معهد متوسط عام</option>
                  <option value="ثانوية شرعية">ثانوية شرعية</option>
                  <option value="ثانوية عامة">ثانوية عامة</option>
                  <option value="تعليم أساسي">تعليم أساسي</option>
                  <option value="لا يوجد شهادة">لا يوجد شهادة</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>التقييم</label>
                <select name="evaluation" value={formData.evaluation} onChange={handleChange} className={inputClass}>
                  <option value="مميز">مميز</option>
                  <option value="ممتاز">ممتاز</option>
                  <option value="جيد">جيد</option>
                  <option value="وسط">وسط</option>
                  <option value="ضعيف">ضعيف</option>
                  <option value="ضعيف جداً">ضعيف جداً</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>المحفوظ من القرآن</label>
                <select name="quranMem" value={formData.quranMem} onChange={handleChange} className={inputClass}>
                  <option value="إجازة">إجازة</option>
                  <option value="إجازة بالقراءات العشر">إجازة بالقراءات العشر</option>
                  <option value="21-30 جزء">21-30 جزء</option>
                  <option value="11-20 جزء">11-20 جزء</option>
                  <option value="5-10 جزء">5-10 جزء</option>
                  <option value="1-4 جزء">1-4 جزء</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>الراتب (ليرة سورية)</label>
                <input name="salary" type="number" value={formData.salary} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>الراتب (دولار)</label>
                <input name="salaryUSD" type="number" value={formData.salaryUSD} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>الوضع الوظيفي</label>
                <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                  <option value="قائم على رأس عمله">قائم على رأس عمله</option>
                  <option value="استقالة">استقالة</option>
                  <option value="إجازة">إجازة</option>
                  <option value="مفصول مؤقت">مفصول مؤقت</option>
                  <option value="مفصول نهائي">مفصول نهائي</option>
                  <option value="نقل ضمن المحافظة">نقل ضمن المحافظة</option>
                  <option value="نقل خارج المحافظة">نقل خارج المحافظة</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>طبيعة الكفالة</label>
                <select name="kafala" value={formData.kafala} onChange={handleChange} className={inputClass}>
                  <option value="كفالة كلية">كفالة كلية</option>
                  <option value="كفالة جزئية">كفالة جزئية</option>
                  <option value="صندوق المسجد أو الجمعيات">صندوق المسجد أو الجمعيات</option>
                  <option value="غير مكفول نهائي">غير مكفول نهائي</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>ملاحظات</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className={inputClass} />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
              <Link href="/" className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                إلغاء
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                {loading ? 'جاري الحفظ...' : 'حفظ العامل'}
              </button>
            </div>
          </form>
        </div>
    </>
  )
}

export default function AddWorkerPage() {
  return (
    <Suspense fallback={null}>
      <AddWorkerForm />
    </Suspense>
  )
}
