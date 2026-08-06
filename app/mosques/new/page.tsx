'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Save } from 'lucide-react'

export default function AddMosquePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    location: '',
    category: 'أ',
    type: 'عام',
    area: '',
    status: 'جيدة',
    isActive: false,
    isDestroyed: 'لا يوجد',
    state: 'جاهز',
    friday: false,
    attachments: 'لا يوجد',
    imam: '',
    khatib: '',
    muezzin: '',
    khadim: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/mosques', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          area: formData.area ? parseFloat(formData.area) : null,
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
            <h1 className="text-2xl font-bold">إضافة مسجد جديد</h1>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>اسم المسجد *</label>
                <input name="name" value={formData.name} onChange={handleChange} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>المدينة/القرية *</label>
                <input name="city" value={formData.city} onChange={handleChange} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>الموقع التفصيلي</label>
                <input name="location" value={formData.location} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>الفئة</label>
                <select name="category" value={formData.category} onChange={handleChange} className={inputClass}>
                  <option value="أ">أ</option>
                  <option value="ب">ب</option>
                  <option value="ج">ج</option>
                  <option value="د">د</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>النوع</label>
                <select name="type" value={formData.type} onChange={handleChange} className={inputClass}>
                  <option value="عام">عام</option>
                  <option value="مركزي">مركزي</option>
                  <option value="عام أثري">عام أثري</option>
                  <option value="مركزي أثري">مركزي أثري</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>المساحة (م²)</label>
                <input name="area" type="number" value={formData.area} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>الحالة الفنية</label>
                <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                  <option value="ممتازة">ممتازة</option>
                  <option value="جيدة">جيدة</option>
                  <option value="متوسطة">متوسطة</option>
                  <option value="ضعيفة">ضعيفة</option>
                  <option value="ضعيفة جداً">ضعيفة جداً</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>الحالة</label>
                <select name="state" value={formData.state} onChange={handleChange} className={inputClass}>
                  <option value="جاهز">جاهز</option>
                  <option value="بانتظار الترميم">بانتظار الترميم</option>
                  <option value="قيد الترميم">قيد الترميم</option>
                  <option value="تم ترميمه">تم ترميمه</option>
                  <option value="قيد البناء">قيد البناء</option>
                  <option value="تم بناؤه">تم بناؤه</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>نسبة الهدم</label>
                <select name="isDestroyed" value={formData.isDestroyed} onChange={handleChange} className={inputClass}>
                  <option value="لا يوجد">لا يوجد</option>
                  <option value="مهدم كلياً">مهدم كلياً</option>
                  <option value="مهدم جزئياً">مهدم جزئياً</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>الملحقات</label>
                <select name="attachments" value={formData.attachments} onChange={handleChange} className={inputClass}>
                  <option value="لا يوجد">لا يوجد</option>
                  <option value="سدة">سدة</option>
                  <option value="قبو">قبو</option>
                  <option value="سدة وقبو">سدة وقبو</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-5 h-5 text-primary rounded" />
                  <span className="text-sm font-medium">مفعل</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="friday" checked={formData.friday} onChange={handleChange} className="w-5 h-5 text-primary rounded" />
                  <span className="text-sm font-medium">خطبة الجمعة</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-lg font-bold text-primary mb-3 mt-4">الكادر الإداري</h3>
              </div>
              <div>
                <label className={labelClass}>الإمام</label>
                <input name="imam" value={formData.imam} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>الخطيب</label>
                <input name="khatib" value={formData.khatib} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>المؤذن</label>
                <input name="muezzin" value={formData.muezzin} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>الخادم</label>
                <input name="khadim" value={formData.khadim} onChange={handleChange} className={inputClass} />
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
                {loading ? 'جاري الحفظ...' : 'حفظ المسجد'}
              </button>
            </div>
          </form>
        </div>
    </>
  )
}
