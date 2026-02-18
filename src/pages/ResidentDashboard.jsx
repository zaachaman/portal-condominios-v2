import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { CheckCircle, AlertCircle, Megaphone } from 'lucide-react'

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export default function ResidentDashboard() {
  const { profile } = useAuth()
  const [currentPayment, setCurrentPayment] = useState(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  useEffect(() => {
    if (profile) fetchData()
  }, [profile])

  async function fetchData() {
    const [{ data: pays }, { data: anns }] = await Promise.all([
      supabase.from('payments').select('*').eq('house_id', profile.id),
      supabase.from('announcements').select('*').order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).limit(3)
    ])
    const current = pays?.find(p => p.month === currentMonth && p.year === currentYear)
    const pending = pays?.filter(p => p.status === 'pending') || []
    setCurrentPayment(current || null)
    setPendingCount(pending.length)
    setAnnouncements(anns || [])
    setLoading(false)
  }

  if (loading) return <div className="loading-screen" style={{minHeight:'auto',padding:40}}><div className="spinner"/></div>

  const isPaid = currentPayment?.status === 'paid'
  const hasPending = currentPayment?.status === 'pending'

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Hola, {profile?.resident_name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Casa {profile?.house_number} · {MONTHS[currentMonth-1]} {currentYear}</p>
        </div>
      </div>

      {/* Status card */}
      <div style={{
        borderRadius:16, padding:28, marginBottom:24,
        background: isPaid ? 'linear-gradient(135deg, #2d6a4f, #40916c)' : hasPending ? 'linear-gradient(135deg, #c1121f, #e63946)' : 'linear-gradient(135deg, #1a1a2e, #2d2d5e)',
        color:'white', boxShadow:'0 8px 32px rgba(0,0,0,0.15)'
      }}>
        <div style={{display:'flex',alignItems:'center',gap:14}}>
          {isPaid ? <CheckCircle size={40} /> : hasPending ? <AlertCircle size={40} /> : <AlertCircle size={40} opacity={0.5}/>}
          <div>
            <h2 style={{fontFamily:'DM Serif Display',fontSize:24,marginBottom:4}}>
              {isPaid ? '¡Pago del mes al día!' : hasPending ? 'Tienes un pago pendiente' : 'Sin cargo este mes'}
            </h2>
            <p style={{opacity:0.8,fontSize:14}}>
              {isPaid ? `Q${Number(currentPayment.amount).toFixed(2)} — ${currentPayment.description}` :
               hasPending ? `Q${Number(currentPayment.amount).toFixed(2)} — ${currentPayment.description}` :
               'No hay cargos registrados para este mes'}
            </p>
          </div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:24}}>
        <div className="stat-card">
          <div className="stat-label">Pagos Pendientes</div>
          <div className="stat-value" style={{color: pendingCount > 0 ? '#c1121f' : '#2d6a4f'}}>{pendingCount}</div>
          <div className="stat-sub"><Link to="/residente/pagos" style={{color:'#c9a84c',fontWeight:600,textDecoration:'none'}}>Ver todos →</Link></div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Casa</div>
          <div className="stat-value">{profile?.house_number}</div>
          <div className="stat-sub">Condominio del Valle 2</div>
        </div>
      </div>

      {/* Recent announcements */}
      {announcements.length > 0 && (
        <div className="card">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
            <h3 className="card-title" style={{marginBottom:0}}><Megaphone size={18} style={{display:'inline',marginRight:8}}/>Anuncios Recientes</h3>
            <Link to="/residente/anuncios" style={{fontSize:13,color:'#c9a84c',fontWeight:600,textDecoration:'none'}}>Ver todos →</Link>
          </div>
          {announcements.map(a => (
            <div key={a.id} className={`announcement-card ${a.is_pinned ? 'pinned' : ''}`}>
              <h4 style={{fontFamily:'DM Serif Display',fontSize:16,marginBottom:4}}>{a.title}</h4>
              <p style={{fontSize:14,color:'#4a4a6a'}}>{a.body.substring(0,120)}{a.body.length > 120 ? '...' : ''}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
