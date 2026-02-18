import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Pin } from 'lucide-react'

export default function ResidentAnnouncements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('announcements').select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .then(({ data }) => { setAnnouncements(data || []); setLoading(false) })
  }, [])

  const formatDate = (d) => new Date(d).toLocaleDateString('es-GT', { day:'numeric', month:'long', year:'numeric' })

  if (loading) return <div className="loading-screen" style={{minHeight:'auto',padding:40}}><div className="spinner"/></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Anuncios</h1>
          <p className="page-subtitle">Comunicados del administrador</p>
        </div>
      </div>

      {announcements.length === 0 ? (
        <div className="empty-state"><h3>Sin anuncios por el momento</h3></div>
      ) : (
        announcements.map(a => (
          <div key={a.id} className={`announcement-card ${a.is_pinned ? 'pinned' : ''}`}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
              {a.is_pinned && <span className="badge badge-gold"><Pin size={10}/> Importante</span>}
              <h3 style={{fontFamily:'DM Serif Display',fontSize:20}}>{a.title}</h3>
            </div>
            <p style={{fontSize:14,color:'#4a4a6a',lineHeight:1.7}}>{a.body}</p>
            <p className="announcement-meta">{formatDate(a.created_at)}</p>
          </div>
        ))
      )}
    </div>
  )
}
