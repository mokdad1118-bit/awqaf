'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  MapPin,
  Ruler,
  Users,
  Edit,
  Trash2,
  GraduationCap,
  BookOpen,
  DollarSign,
  Star,
  Building2
} from 'lucide-react'
import type { Mosque } from '@/types'

export default function MosqueDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [mosque, setMosque] = useState<Mosque | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMosque()
  }, [params.id])

  const fetchMosque = async () => {
    try {
      const res = await fetch(`/api/mosques/${params.id}`)
      const data = await res.json()
      setMosque(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا المسجد؟')) return
    try {
      await fetch(`/api/mosques/${params.id}`, { method: 'DELETE' })
      router.push('/')
    } catch (error) {
      console.error('Error:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      </div>
    )
  }

  if (!mosque) {
    return (
      <div className="p-6">
        <p className="text-center text-gray-500">المسجد غير موجود</p>
      </div>
    )
  }

  const getEvalColor = (eval_: string) => {
    const colors: Record<string, string> = {
      'ممتاز': 'bg-emerald-100 text-emerald-700',
      'جيد': 'bg-blue-100 text-blue-700',
      'وسط': 'bg-amber-100 text-amber-700',
      'ضعيف': 'bg-red-100 text-red-700',
    }
    return colors[eval_] || 'bg-gray-100 text-gray-700'
  }

  const getRoleColor = (role: string) => {
    if (role.includes('إمام') && role.includes('خطيب')) return 'bg-purple-100 text-purple-700'
    if (role === 'إمام') return 'bg-blue-100 text-blue-700'
    if (role === 'خطيب') return 'bg-emerald-100 text-emerald-700'
    if (role.includes('مؤذن')) return 'bg-amber-100 text-amber-700'
    if (role === 'خادم') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-700'
  }

  return (
    <>
      <div className="bg-gradient-to-br from-primary-dark to-primary text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                <ArrowRight size={20} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{mosque.name}</h1>
                <p className="text-white/70 flex items-center gap-2 mt-1">
                  <MapPin size={14} />
                  {mosque.city} — {mosque.location}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/mosques/${mosque.id}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-gold text-primary-dark rounded-lg font-medium hover:bg-gold-light transition-colors"
              >
                <Edit size={16} />
                تعديل
              </Link>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                <Trash2 size={16} />
                حذف
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Mosque Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <Building2 size={20} className="text-gold" />
              بيانات المسجد
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoItem label="الفئة" value={`فئة ${mosque.category}`} />
              <InfoItem label="النوع" value={mosque.type} />
              <InfoItem label="الحالة الفنية" value={mosque.status} />
              <InfoItem label="الحالة" value={mosque.state} />
              <InfoItem label="المساحة" value={mosque.area ? `${mosque.area} م²` : '—'} />
              <InfoItem label="خطبة الجمعة" value={mosque.friday ? '✅ نعم' : '❌ لا'} />
              <InfoItem label="الملحقات" value={mosque.attachments || 'لا يوجد'} />
              <InfoItem label="التفعيل" value={mosque.isActive ? 'مفعل' : 'غير مفعل'} />
              {mosque.isDestroyed && mosque.isDestroyed !== 'لا يوجد' && (
                <InfoItem label="الهدم" value={mosque.isDestroyed} highlight />
              )}
            </div>
          </div>

          {/* Staff Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <Users size={20} className="text-gold" />
              الكادر الإداري
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoItem label="الإمام" value={mosque.imam || '—'} />
              <InfoItem label="الخطيب" value={mosque.khatib || '—'} />
              <InfoItem label="المؤذن" value={mosque.muezzin || '—'} />
              <InfoItem label="الخادم" value={mosque.khadim || '—'} />
            </div>
          </div>

          {/* Workers Table */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                <Users size={20} className="text-gold" />
                العاملين في المسجد ({mosque.workers?.length || 0})
              </h2>
              <Link
                href={`/workers/new?mosqueId=${mosque.id}`}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                + إضافة عامل
              </Link>
            </div>

            {mosque.workers && mosque.workers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-primary text-white">
                      <th className="px-4 py-3 text-right text-sm font-bold">#</th>
                      <th className="px-4 py-3 text-right text-sm font-bold">الاسم</th>
                      <th className="px-4 py-3 text-right text-sm font-bold">المسمى الوظيفي</th>
                      <th className="px-4 py-3 text-right text-sm font-bold">الشهادة</th>
                      <th className="px-4 py-3 text-right text-sm font-bold">التقييم</th>
                      <th className="px-4 py-3 text-right text-sm font-bold">الحفظ</th>
                      <th className="px-4 py-3 text-right text-sm font-bold">الراتب (ل.س)</th>
                      <th className="px-4 py-3 text-right text-sm font-bold">الكفالة</th>
                      <th className="px-4 py-3 text-right text-sm font-bold">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mosque.workers.map((worker, index) => (
                      <tr key={worker.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{index + 1}</td>
                        <td className="px-4 py-3 text-sm font-bold text-primary-dark">
                          {worker.name}
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
                        <td className="px-4 py-3 text-sm font-bold text-primary">
                          {worker.salary.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm">{worker.kafala}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Link
                              href={`/workers/${worker.id}/edit`}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            >
                              <Edit size={14} />
                            </Link>
                            <button
                              onClick={async () => {
                                if (!confirm('هل أنت متأكد؟')) return
                                await fetch(`/api/workers/${worker.id}`, { method: 'DELETE' })
                                fetchMosque()
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8">لا يوجد عاملين مسجلين</p>
            )}
          </div>
        </div>
    </>
  )
}

function InfoItem({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`p-3 rounded-lg ${highlight ? 'bg-red-50 border-r-2 border-red-500' : 'bg-gray-50 border-r-2 border-primary'}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-sm font-bold ${highlight ? 'text-red-700' : 'text-gray-900'}`}>{value}</p>
    </div>
  )
}
