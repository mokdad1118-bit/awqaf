'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import type { Worker } from '@/types'

export default function EditWorkerPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [worker, setWorker] = useState<Worker | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    nationalId: '',
    mosqueId: 0,
    role: '',
    education: '',
    evaluation: '',
    quranMem: '',
    salary: 0,
    salaryUSD: 0,
    status: '',
    kafala: '',
    notes: '',
  })

  useEffect(() => {
    fetchWorker()
  }, [params.id])

  const fetchWorker = async () => {
    try {
      const res = await fetch(`/api/workers/${params.id}`)
      const data = await res.json()
      setWorker(data)
      setFormData({
        name: data.name,
        nationalId: data.nationalId,
        mosqueId: data.mosqueId,
        role: data.role,
        education: data.education,
        evaluation: data.evaluation,
        quranMem: data.quranMem,
        salary: data.salary,
        salaryUSD: data.salaryUSD,
        status: data.status,
        kafala: data.kafala,
        notes: data.notes || '',
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
      await fetch(`/api/workers/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      router.push('/workers')
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
            <h2 className="text-lg font-bold text-primary mb-6">تعديل بيانات العامل</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الثلاثي</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الرقم الوطني</label>
                  <input
                    type="text"
                    value={formData.nationalId}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المسمى الوظيفي</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الشهادة</label>
                  <input
                    type="text"
                    value={formData.education}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">التقييم</label>
                  <select
                    value={formData.evaluation}
                    onChange={(e) => setFormData({ ...formData, evaluation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="ممتاز">ممتاز</option>
                    <option value="جيد">جيد</option>
                    <option value="وسط">وسط</option>
                    <option value="ضعيف">ضعيف</option>
                    <option value="ضعيف جداً">ضعيف جداً</option>
                    <option value="مميز">مميز</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الحفظ</label>
                  <select
                    value={formData.quranMem}
                    onChange={(e) => setFormData({ ...formData, quranMem: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="إجازة">إجازة</option>
                    <option value="إجازة بالقراءات العشر">إجازة بالقراءات العشر</option>
                    <option value="1-4 جزء">1-4 جزء</option>
                    <option value="5-10 جزء">5-10 جزء</option>
                    <option value="11-20 جزء">11-20 جزء</option>
                    <option value="21-30 جزء">21-30 جزء</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الراتب (ل.س)</label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الراتب ($)</label>
                  <input
                    type="number"
                    value={formData.salaryUSD}
                    onChange={(e) => setFormData({ ...formData, salaryUSD: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوضع</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">الكفالة</label>
                  <select
                    value={formData.kafala}
                    onChange={(e) => setFormData({ ...formData, kafala: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="كفالة كلية">كفالة كلية</option>
                    <option value="كفالة جزئية">كفالة جزئية</option>
                    <option value="صندوق المسجد أو الجمعيات">صندوق المسجد أو الجمعيات</option>
                    <option value="غير مكفول نهائي">غير مكفول نهائي</option>
                  </select>
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={3}
                />
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
                  onClick={() => router.push('/workers')}
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
