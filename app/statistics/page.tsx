'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import type { Mosque, Worker } from '@/types'

const COLORS = ['#1a5f3f', '#2d8a5e', '#c9a84c', '#e8d48b', '#0d3d28', '#4ade80']

export default function StatisticsPage() {
  const [mosques, setMosques] = useState<Mosque[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [mRes, wRes] = await Promise.all([fetch('/api/mosques?limit=100'), fetch('/api/workers?limit=100')])
      const mData = await mRes.json()
      const wData = await wRes.json()
      setMosques(mData.data || mData)
      setWorkers(wData.data || wData)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const categoryData = useMemo(() => [
    { name: 'فئة أ', value: mosques.filter(m => m.category === 'أ').length },
    { name: 'فئة ب', value: mosques.filter(m => m.category === 'ب').length },
    { name: 'فئة ج', value: mosques.filter(m => m.category === 'ج').length },
    { name: 'فئة د', value: mosques.filter(m => m.category === 'د').length },
  ], [mosques])

  const statusData = useMemo(() => [
    { name: 'ممتازة', count: mosques.filter(m => m.status === 'ممتازة').length },
    { name: 'جيدة', count: mosques.filter(m => m.status === 'جيدة').length },
    { name: 'متوسطة', count: mosques.filter(m => m.status === 'متوسطة').length },
    { name: 'ضعيفة', count: mosques.filter(m => m.status === 'ضعيفة').length },
  ], [mosques])

  const roleData = useMemo(() => [
    { name: 'خطيب', count: workers.filter(w => w.role === 'خطيب').length },
    { name: 'إمام', count: workers.filter(w => w.role === 'إمام').length },
    { name: 'مؤذن', count: workers.filter(w => w.role.includes('مؤذن') && !w.role.includes('إمام')).length },
    { name: 'خادم', count: workers.filter(w => w.role === 'خادم').length },
    { name: 'متعدد', count: workers.filter(w => w.role.includes('و')).length },
  ], [workers])

  const totalSalary = useMemo(
    () => workers.reduce((acc, w) => acc + w.salary, 0),
    [workers]
  )

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mt-20" />
      </div>
    )
  }

  return (
    <>
      <div className="bg-gradient-to-br from-primary-dark to-primary text-white p-6">
          <h1 className="text-2xl font-bold">الإحصائيات والتقارير</h1>
          <p className="text-white/70 mt-1">نظرة شاملة على بيانات المساجد والعاملين</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard title="إجمالي المساجد" value={mosques.length} color="bg-blue-50 text-blue-700" />
            <StatCard title="إجمالي العاملين" value={workers.length} color="bg-green-50 text-green-700" />
            <StatCard title="المساجد المفعلة" value={mosques.filter(m => m.isActive).length} color="bg-emerald-50 text-emerald-700" />
            <StatCard title="خطبة الجمعة" value={mosques.filter(m => m.friday).length} color="bg-purple-50 text-purple-700" />
            <StatCard title="المهدمة" value={mosques.filter(m => m.isDestroyed && m.isDestroyed !== 'لا يوجد').length} color="bg-red-50 text-red-700" />
            <StatCard title="مجموع الرواتب" value={totalSalary.toLocaleString()} color="bg-amber-50 text-amber-700" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="توزيع المساجد حسب الفئة">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart><Pie data={categoryData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({name,value})=>`${name}: ${value}`}>
                  {categoryData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                </Pie><Tooltip /><Legend /></PieChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="الحالة الفنية للمساجد">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#1a5f3f" radius={[8,8,0,0]} /></BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="توزيع العاملين حسب الوظيفة">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={roleData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#c9a84c" radius={[8,8,0,0]} /></BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="الشهادات الدراسية">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart><Pie data={[
                  {name:'إجازة شرعية',count:workers.filter(w=>w.education.includes('إجازة')).length},
                  {name:'معهد',count:workers.filter(w=>w.education.includes('معهد')).length},
                  {name:'ثانوية',count:workers.filter(w=>w.education.includes('ثانوية')).length},
                  {name:'تعليم أساسي',count:workers.filter(w=>w.education==='تعليم أساسي').length},
                  {name:'بدون شهادة',count:workers.filter(w=>w.education==='لا يوجد شهادة').length},
                ]} cx="50%" cy="50%" outerRadius={100} dataKey="count" label={({name,value})=>`${name}: ${value}`}>
                  {Array.from({length:5}).map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                </Pie><Tooltip /><Legend /></PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
    </>
  )
}

function StatCard({ title, value, color }: { title: string; value: string | number; color: string }) {
  return (
    <div className={`rounded-xl p-5 ${color.split(' ')[0]} border border-gray-100`}>
      <p className="text-sm opacity-70 mb-1">{title}</p>
      <p className={`text-2xl font-bold ${color.split(' ')[1]}`}>{value}</p>
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-primary mb-4">{title}</h3>
      {children}
    </div>
  )
}
