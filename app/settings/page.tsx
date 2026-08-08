'use client'

import { useState, useEffect } from 'react'
import { Database, Download, Upload, FileSpreadsheet, FileText, Users, Plus, Trash2, Edit } from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Mosque, Worker } from '@/types'
import { useAuth } from '@/lib/auth'

interface SystemUser {
  id: number
  username: string
  role: string
  permissions: string[]
  createdAt: string
}

export default function SettingsPage() {
  const [mosques, setMosques] = useState<Mosque[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [users, setUsers] = useState<SystemUser[]>([])
  const [loading, setLoading] = useState(false)
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null)
  const [userFormData, setUserFormData] = useState({
    username: '',
    password: '',
    role: 'user',
    permissions: [] as string[],
  })
  const { isAdmin } = useAuth()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [mRes, wRes, uRes] = await Promise.all([
        fetch('/api/mosques'),
        fetch('/api/workers'),
        fetch('/api/users')
      ])
      setMosques(await mRes.json())
      setWorkers(await wRes.json())
      const usersData = await uRes.json()
      setUsers(usersData.map((u: any) => ({
        ...u,
        permissions: u.permissions ? JSON.parse(u.permissions as string) : []
      })))
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const exportToExcel = () => {
    setLoading(true)
    try {
      console.log('Starting Excel export...')
      console.log('Mosques:', mosques.length)
      console.log('Workers:', workers.length)

      // Create workbook
      const wb = XLSX.utils.book_new()

      // Mosques sheet
      const mosquesData = mosques.map(m => ({
        'الاسم': m.name,
        'المدينة': m.city,
        'الموقع': m.location,
        'الفئة': m.category,
        'النوع': m.type,
        'المساحة': m.area,
        'الحالة الفنية': m.status,
        'مفعل': m.isActive ? 'نعم' : 'لا',
        'التدمير': m.isDestroyed,
        'الحالة': m.state,
        'صلاة جمعة': m.friday ? 'نعم' : 'لا',
        'الملحقات': m.attachments,
        'الإمام': m.imam,
        'الخطيب': m.khatib,
        'المؤذن': m.muezzin,
        'الخادم': m.khadim,
      }))
      const mosquesSheet = XLSX.utils.json_to_sheet(mosquesData)
      XLSX.utils.book_append_sheet(wb, mosquesSheet, 'المساجد')

      // Workers sheet
      const workersData = workers.map(w => ({
        'الاسم': w.name,
        'الرقم الوطني': w.nationalId,
        'المسجد': w.mosque?.name,
        'المسمى الوظيفي': w.role,
        'الشهادة': w.education,
        'التقييم': w.evaluation,
        'الحفظ': w.quranMem,
        'الراتب': w.salary,
        'الراتب ($)': w.salaryUSD,
        'الوضع': w.status,
        'الكفالة': w.kafala,
        'ملاحظات': w.notes,
      }))
      const workersSheet = XLSX.utils.json_to_sheet(workersData)
      XLSX.utils.book_append_sheet(wb, workersSheet, 'العاملين')

      // Download
      XLSX.writeFile(wb, 'mosque-management.xlsx')
      console.log('Excel export completed successfully')
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      alert('حدث خطأ أثناء تصدير Excel: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const exportToPDF = () => {
    setLoading(true)
    try {
      console.log('Starting PDF export...')
      console.log('Mosques:', mosques.length)
      console.log('Workers:', workers.length)

      const doc = new jsPDF('p', 'mm', 'a4')
      const pageWidth = doc.internal.pageSize.getWidth()

      // Title
      doc.setFontSize(20)
      doc.text('تقرير إدارة المساجد', pageWidth / 2, 20, { align: 'center' })
      doc.setFontSize(10)
      doc.text(`مديرية أوقاف السويداء - ${new Date().toLocaleDateString('ar-EG')}`, pageWidth / 2, 28, { align: 'center' })

      // Mosques table
      doc.setFontSize(14)
      doc.text('المساجد', 14, 40)
      autoTable(doc, {
        startY: 45,
        head: [['الاسم', 'المدينة', 'الفئة', 'الحالة', 'مفعل']],
        body: mosques.map(m => [
          m.name || '',
          m.city || '',
          m.category || '',
          m.status || '',
          m.isActive ? 'نعم' : 'لا'
        ]),
        styles: { font: 'helvetica', fontSize: 8 },
        headStyles: { fillColor: [26, 95, 63] },
        alternateRowStyles: { fillColor: [240, 240, 240] },
      })

      // Workers table
      const finalY = (doc as any).lastAutoTable.finalY + 10
      doc.setFontSize(14)
      doc.text('العاملين', 14, finalY)
      autoTable(doc, {
        startY: finalY + 5,
        head: [['الاسم', 'المسمى الوظيفي', 'المسجد', 'الراتب']],
        body: workers.map(w => [
          w.name || '',
          w.role || '',
          w.mosque?.name || '',
          w.salary?.toLocaleString() || '0'
        ]),
        styles: { font: 'helvetica', fontSize: 8 },
        headStyles: { fillColor: [201, 168, 76] },
        alternateRowStyles: { fillColor: [240, 240, 240] },
      })

      doc.save('mosque-management.pdf')
      console.log('PDF export completed successfully')
    } catch (error) {
      console.error('Error exporting to PDF:', error)
      alert('حدث خطأ أثناء تصدير PDF: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const exportToJSON = () => {
    const data = { mosques, workers }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mosque-management.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleAddUser = () => {
    setEditingUser(null)
    setUserFormData({
      username: '',
      password: '',
      role: 'user',
      permissions: [],
    })
    setShowUserForm(true)
  }

  const handleEditUser = (user: SystemUser) => {
    setEditingUser(user)
    setUserFormData({
      username: user.username,
      password: '',
      role: user.role,
      permissions: user.permissions,
    })
    setShowUserForm(true)
  }

  const handleDeleteUser = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return
    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingUser) {
        await fetch(`/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userFormData),
        })
      } else {
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userFormData),
        })
      }
      setShowUserForm(false)
      fetchData()
    } catch (error) {
      console.error('Error saving user:', error)
    }
  }

  const togglePermission = (permission: string) => {
    setUserFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }))
  }

  return (
    <>
      <div className="bg-gradient-to-br from-primary-dark to-primary text-white p-6">
          <h1 className="text-2xl font-bold">الإعدادات</h1>
          <p className="text-white/70 mt-1">إدارة النظام والبيانات</p>
        </div>
        <div className="p-6 space-y-6 max-w-4xl">
          {/* User Management Section - Admin Only */}
          {isAdmin && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                  <Users size={20} className="text-gold" />
                  إدارة المستخدمين
                </h2>
                <button
                  onClick={handleAddUser}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  <Plus size={16} />
                  إضافة مستخدم
                </button>
              </div>

              {showUserForm && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-bold text-primary mb-4">
                    {editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}
                  </h3>
                  <form onSubmit={handleSaveUser} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم</label>
                        <input
                          type="text"
                          value={userFormData.username}
                          onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
                        <input
                          type="password"
                          value={userFormData.password}
                          onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          required={!editingUser}
                          placeholder={editingUser ? 'اتركه فارغاً للحفاظ على كلمة المرور الحالية' : ''}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الدور</label>
                        <select
                          value={userFormData.role}
                          onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="user">مستخدم عادي</option>
                          <option value="admin">مدير النظام</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الصلاحيات</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['التنمية الإدارية', 'الحلقات التربوية', 'المحاسبة', 'العاملين', 'المساجد', 'الرئيسية', 'حذف العاملين'].map((permission) => (
                          <button
                            key={permission}
                            type="button"
                            onClick={() => togglePermission(permission)}
                            className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                              userFormData.permissions.includes(permission)
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            {permission}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                      >
                        {editingUser ? 'حفظ التغييرات' : 'إضافة المستخدم'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowUserForm(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">اسم المستخدم</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">الدور</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">الصلاحيات</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100">
                        <td className="px-4 py-3 text-sm font-medium">{user.username}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {user.role === 'admin' ? 'مدير النظام' : 'مستخدم عادي'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {user.permissions.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {user.permissions.map((perm) => (
                                <span key={perm} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                                  {perm}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">لا توجد صلاحيات</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="تعديل"
                            >
                              <Edit size={14} />
                            </button>
                            {user.username !== 'admin' && (
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="حذف"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Data Export Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <Database size={20} className="text-gold" />
              تصدير البيانات
            </h2>
            <div className="space-y-3">
              <button
                onClick={exportToExcel}
                disabled={loading}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-right disabled:opacity-50"
              >
                <FileSpreadsheet size={20} className="text-green-600" />
                <div>
                  <p className="font-bold text-sm">تصدير إلى Excel</p>
                  <p className="text-xs text-gray-500">تصدير البيانات إلى ملف Excel</p>
                </div>
              </button>
              <button
                onClick={exportToPDF}
                disabled={loading}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-right disabled:opacity-50"
              >
                <FileText size={20} className="text-red-600" />
                <div>
                  <p className="font-bold text-sm">تصدير إلى PDF</p>
                  <p className="text-xs text-gray-500">تصدير البيانات إلى ملف PDF</p>
                </div>
              </button>
              <button
                onClick={exportToJSON}
                disabled={loading}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-right disabled:opacity-50"
              >
                <Download size={20} className="text-primary" />
                <div>
                  <p className="font-bold text-sm">تصدير إلى JSON</p>
                  <p className="text-xs text-gray-500">تصدير جميع البيانات إلى ملف JSON</p>
                </div>
              </button>
            </div>
          </div>
        </div>
    </>
  )
}
