import { useState, useEffect } from 'react'
import { supabase } from '../../../config/supabase'
import { Plus, Pencil, Trash2, X, Image, ExternalLink, Eye, EyeOff } from 'lucide-react'

const EMPTY_FORM = { title: '', body: '', image_url: '', cta_text: '', cta_url: '' }

export default function PopupsTab() {
  const [popups, setPopups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => { loadPopups() }, [])

  const loadPopups = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('mindset_popups')
      .select('*')
      .order('created_at', { ascending: false })
    setPopups(data || [])
    setLoading(false)
  }

  const openCreate = () => {
    setEditingId(null)
    setFormData(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (popup) => {
    setEditingId(popup.id)
    setFormData({
      title: popup.title,
      body: popup.body,
      image_url: popup.image_url || '',
      cta_text: popup.cta_text || '',
      cta_url: popup.cta_url || '',
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData(EMPTY_FORM)
  }

  const savePopup = async () => {
    if (!formData.title.trim() || !formData.body.trim()) return
    setSaving(true)

    const payload = {
      title: formData.title.trim(),
      body: formData.body.trim(),
      image_url: formData.image_url.trim() || null,
      cta_text: formData.cta_text.trim() || null,
      cta_url: formData.cta_url.trim() || null,
      updated_at: new Date().toISOString(),
    }

    if (editingId) {
      await supabase.from('mindset_popups').update(payload).eq('id', editingId)
    } else {
      await supabase.from('mindset_popups').insert({ ...payload, is_active: false })
    }

    setSaving(false)
    closeForm()
    loadPopups()
  }

  const toggleActive = async (id, currentState) => {
    await supabase
      .from('mindset_popups')
      .update({ is_active: !currentState, updated_at: new Date().toISOString() })
      .eq('id', id)
    setPopups(prev => prev.map(p => p.id === id ? { ...p, is_active: !currentState } : p))
  }

  const deletePopup = async (id) => {
    await supabase.from('mindset_popups').delete().eq('id', id)
    setConfirmDelete(null)
    setPopups(prev => prev.filter(p => p.id !== id))
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass-card p-6 h-24 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-gold">📢 פופאפים</h2>
          <p className="text-xs text-frost-white/30 mt-1">ניהול הודעות קופצות למשתמשים</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/15 border border-gold/30 text-gold text-sm font-bold hover:bg-gold/25 transition-colors"
        >
          <Plus className="w-4 h-4" />
          חדש
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-3 text-center">
          <span className="text-lg font-bold text-frost-white block">{popups.length}</span>
          <span className="text-[10px] text-frost-white/30">סה״כ פופאפים</span>
        </div>
        <div className="glass-card p-3 text-center">
          <span className="text-lg font-bold text-success block">{popups.filter(p => p.is_active).length}</span>
          <span className="text-[10px] text-frost-white/30">פעילים עכשיו</span>
        </div>
      </div>

      {/* Popup list */}
      {popups.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-frost-white/30 text-sm">אין פופאפים עדיין</p>
          <p className="text-frost-white/20 text-xs mt-1">לחץ "חדש" כדי ליצור את הראשון</p>
        </div>
      ) : (
        <div className="space-y-2">
          {popups.map(popup => (
            <div key={popup.id} className={`glass-card p-4 transition-all ${popup.is_active ? 'border-success/20' : ''}`}>
              <div className="flex items-start gap-3">
                {/* Image thumbnail */}
                {popup.image_url && (
                  <img
                    src={popup.image_url}
                    alt=""
                    className="w-14 h-14 rounded-lg object-cover shrink-0"
                  />
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-frost-white truncate">{popup.title}</h3>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      popup.is_active
                        ? 'bg-success/15 text-success'
                        : 'bg-white/5 text-frost-white/30'
                    }`}>
                      {popup.is_active ? 'פעיל' : 'כבוי'}
                    </span>
                  </div>
                  <p className="text-xs text-frost-white/40 line-clamp-2">{popup.body}</p>
                  {popup.cta_text && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <ExternalLink className="w-3 h-3 text-dusty-aqua/50" />
                      <span className="text-[10px] text-dusty-aqua/50">{popup.cta_text}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Toggle */}
                  <button
                    onClick={() => toggleActive(popup.id, popup.is_active)}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
                    title={popup.is_active ? 'כבה' : 'הפעל'}
                  >
                    {popup.is_active
                      ? <Eye className="w-4 h-4 text-success" />
                      : <EyeOff className="w-4 h-4 text-frost-white/20" />
                    }
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => openEdit(popup)}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
                    title="ערוך"
                  >
                    <Pencil className="w-4 h-4 text-frost-white/30" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => confirmDelete === popup.id ? deletePopup(popup.id) : setConfirmDelete(popup.id)}
                    className={`min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg transition-colors ${
                      confirmDelete === popup.id ? 'bg-danger/15 hover:bg-danger/25' : 'hover:bg-white/5'
                    }`}
                    title={confirmDelete === popup.id ? 'לחץ שוב למחיקה' : 'מחק'}
                  >
                    <Trash2 className={`w-4 h-4 ${confirmDelete === popup.id ? 'text-danger' : 'text-frost-white/20'}`} />
                  </button>
                </div>
              </div>

              {/* Created date */}
              <p className="text-[9px] text-frost-white/15 mt-2">
                נוצר: {new Date(popup.created_at).toLocaleDateString('he-IL')}
                {popup.updated_at !== popup.created_at && (
                  <> · עודכן: {new Date(popup.updated_at).toLocaleDateString('he-IL')}</>
                )}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card p-6 max-w-md w-full mx-4 border-gold/20 animate-bounce-in relative">
            <button
              onClick={closeForm}
              className="absolute top-3 left-3 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg hover:bg-white/5"
            >
              <X className="w-5 h-5 text-frost-white/40" />
            </button>

            <h3 className="font-display text-lg font-bold text-gold mb-4">
              {editingId ? 'עריכת פופאפ' : 'פופאפ חדש'}
            </h3>

            <div className="space-y-3">
              {/* Title */}
              <div>
                <label className="text-[10px] text-frost-white/40 block mb-1">כותרת *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2.5 text-frost-white text-sm focus:border-gold/30 focus:outline-none transition-colors"
                  placeholder="כותרת הפופאפ"
                  dir="rtl"
                />
              </div>

              {/* Body */}
              <div>
                <label className="text-[10px] text-frost-white/40 block mb-1">תוכן *</label>
                <textarea
                  value={formData.body}
                  onChange={e => setFormData(prev => ({ ...prev, body: e.target.value }))}
                  rows={3}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2.5 text-frost-white text-sm focus:border-gold/30 focus:outline-none transition-colors resize-none"
                  placeholder="טקסט ההודעה"
                  dir="rtl"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="text-[10px] text-frost-white/40 block mb-1">
                  <Image className="w-3 h-3 inline ml-1" />
                  קישור לתמונה (אופציונלי)
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={e => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2.5 text-frost-white text-sm focus:border-gold/30 focus:outline-none transition-colors"
                  placeholder="https://..."
                  dir="ltr"
                />
                {formData.image_url && (
                  <img src={formData.image_url} alt="preview" className="w-full h-24 object-cover rounded-lg mt-2" />
                )}
              </div>

              {/* CTA */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-frost-white/40 block mb-1">טקסט כפתור</label>
                  <input
                    type="text"
                    value={formData.cta_text}
                    onChange={e => setFormData(prev => ({ ...prev, cta_text: e.target.value }))}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2.5 text-frost-white text-sm focus:border-gold/30 focus:outline-none transition-colors"
                    placeholder="לדוגמה: גלה עוד"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-frost-white/40 block mb-1">קישור כפתור</label>
                  <input
                    type="url"
                    value={formData.cta_url}
                    onChange={e => setFormData(prev => ({ ...prev, cta_url: e.target.value }))}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2.5 text-frost-white text-sm focus:border-gold/30 focus:outline-none transition-colors"
                    placeholder="https://..."
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-5">
              <button
                onClick={savePopup}
                disabled={saving || !formData.title.trim() || !formData.body.trim()}
                className="flex-1 py-2.5 rounded-xl bg-gold/15 border border-gold/30 text-gold font-bold text-sm hover:bg-gold/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? 'שומר...' : editingId ? 'שמור שינויים' : 'צור פופאפ'}
              </button>
              <button
                onClick={closeForm}
                className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-frost-white/50 text-sm hover:bg-white/10 transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
