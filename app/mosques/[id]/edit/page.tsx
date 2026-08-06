'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import type { Mosque } from '@/types'

export default function EditMosquePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [mosque, setMosque] = useState<Mosque | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    location: '',
    category: '',
    type: '',
    area: 0,
    status: '',
    isActive: false,
    isDestroyed: '',
    state: '',
    friday: false,
    attachments: '',
    imam: '',
    khatib: '',
    muezzin: '',
    khadim: '',
  })

  useEffect(() => {
    fetchMosque()
  }, [params.id])

  const fetchMosque = async () => {
    try {
      const res = await fetch(`/api/mosques/${params.id}`)
      const data = await res.json()
      setMosque(data)
      setFormData({
        name: data.name,
        city: data.city,
        location: data.location,
        category: data.category,
        type: data.type,
        area: data.area || 0,
        status: data.status,
        isActive: data.isActive,
        isDestroyed: data.isDestroyed || 'لا يوجد',
        state: data.state,
        friday: data.friday,
        attachments: data.attachments || 'لا يوجد',
        imam: data.imam || '',
        khatib: data.khatib || '',
        muezzin: data.muezzin || '',
        khadim: data.khadim || '',
      })
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch(`/api/mosques/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      router.push('/mosques')
    } catch (error) {
      console.error('Error:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <>
      <Header onSearch={() => {}} />
        <div className="p-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-primary mb-6">تعديل بيانات المسجد</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم المسجد</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المدينة/القرية</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الموقع</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="أ">فئة أ</option>
                    <option value="ب">فئة ب</option>
                    <option value="ج">فئة ج</option>
                    <option value="د">فئة د</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">النوع</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="عام">عام</option>
                    <option value="مركزي">مركزي</option>
                    <option value="عام أثري">عام أثري</option>
                    <option value="مركزي أثري">مركزي أثري</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المساحة (م²)</label>
                  <input
                    type="number"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الحالة الفنية</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="ممتازة">ممتازة</option>
                    <option value="جيدة">جيدة</option>
                    <option value="متوسطة">متوسطة</option>
                    <option value="ضعيفة">ضعيفة</option>
                    <option value="ضعيفة جداً">ضعيفة جداً</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="جاهز">جاهز</option>
                    <option value="بانتظار الترميم">بانتظار الترميم</option>
                    <option value="قيد الترميم">قيد الترميم</option>
                    <option value="تم ترميمه">تم ترميمه</option>
                    <option value="قيد البناء">قيد البناء</option>
                    <option value="تم بناؤه">تم بناؤه</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">التدمير</label>
                  <select
                    value={formData.isDestroyed}
                    onChange={(e) => setFormData({ ...formData, isDestroyed: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="لا يوجد">لا يوجد</option>
                    <option value="مهدم كلياً">مهدم كلياً</option>
                    <option value="مهدم جزئياً">مهدم جزئياً</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الملحقات</label>
                  <select
                    value={formData.attachments}
                    onChange={(e) => setFormData({ ...formData, attachments: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="لا يوجد">لا يوجد</option>
                    <option value="سدة">سدة</option>
                    <option value="قبو">قبو</option>
                    <option value="سدة وقبو">سدة وقبو</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الإمام</label>
                  <input
                    type="text"
                    value={formData.imam}
                    onChange={(e) => setFormData({ ...formData, imam: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الخطيب</label>
                  <input
                    type="text"
                    value={formData.khatib}
                    onChange={(e) => setFormData({ ...formData, khatib: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المؤذن</label>
                  <input
                    type="text"
                    value={formData.muezzin}
                    onChange={(e) => setFormData({ ...formData, muezzin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الخادم</label>
                  <input
                    type="text"
                    value={formData.khadim}
                    onChange={(e) => setFormData({ ...formData, khadim: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">مفعل</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.friday}
                    onChange={(e) => setFormData({ ...formData, friday: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">صلاة جمعة</span>
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  حفظ التغييرات
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/mosques')}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
    </>
  )
}
