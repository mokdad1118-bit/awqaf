'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

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

export default function NewRewardPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    teacherName: '',
    region: '',
    mosque: '',
    amountDue: '',
    amountPaid: '',
    month: '',
    year: 2025,
    notes: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const copyData = localStorage.getItem('copyRewardData')
    if (copyData) {
      const data = JSON.parse(copyData)
      setFormData({
        teacherName: data.teacherName,
        region: data.region,
        mosque: data.mosque,
        amountDue: data.amountDue.toString(),
        amountPaid: data.amountPaid.toString(),
        month: data.month,
        year: data.year,
        notes: data.notes || '',
      })
      localStorage.removeItem('copyRewardData')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = {
        ...formData,
        amountDue: formData.amountDue ? parseInt(formData.amountDue) : 0,
        amountPaid: formData.amountPaid ? parseInt(formData.amountPaid) : 0,
      }

      const res = await fetch('/api/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })

      if (res.ok) {
        router.push('/rewards')
      } else {
        alert('حدث خطأ أثناء إضافة المكافأة')
      }
    } catch (error) {
      alert('حدث خطأ أثناء إضافة المكافأة')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-primary-dark to-primary text-white p-6">
        <h1 className="text-2xl font-bold">إضافة مكافأة جديدة</h1>
        <p className="text-white/70 mt-1">إضافة سجل مكافأة شهرية جديد</p>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  اسم المدرس
                </label>
                <input
                  type="text"
                  value={formData.teacherName}
                  onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  المنطقة
                </label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  المسجد
                </label>
                <input
                  type="text"
                  value={formData.mosque}
                  onChange={(e) => setFormData({ ...formData, mosque: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الشهر
                </label>
                <select
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                >
                  <option value="">اختر الشهر</option>
                  {months.map((month) => (
                    <option key={month.name} value={month.name}>{month.number} - {month.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  السنة
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                  <option value="2029">2029</option>
                  <option value="2030">2030</option>
                  <option value="2031">2031</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  المبلغ المستحق
                </label>
                <input
                  type="number"
                  value={formData.amountDue}
                  onChange={(e) => setFormData({ ...formData, amountDue: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  المجموع
                </label>
                <input
                  type="number"
                  value={formData.amountPaid}
                  onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ملاحظات
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'جاري الحفظ...' : 'حفظ المكافأة'}
                <ArrowRight size={18} />
              </button>
              
              <button
                type="button"
                onClick={() => router.push('/rewards')}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
