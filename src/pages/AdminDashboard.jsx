import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Home, AlertCircle, CheckCircle, DollarSign, ChevronRight } from 'lucide-react'

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 52, pending: 0, paid: 0, noData: 0 })
  const [pendingHouses, setPendingHouses] = useState([])
  const [loading, setLoading] = useState(true)
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    const { data: profiles } = await supabase.from('profiles').select('*').eq('role', 'resident')
    const { data: payments } = await supabase.from('payments')
      .select('*').eq('month', currentMonth).eq('year', currentYear)

    const pending = payments?.filter(p => p.status === 'pending') || []
    const paid = payments?.filter(p => p.status === 'paid') || []
    const noData = 52 - (new Set(payments?.map(p => p.house_id))).size

    const pendingProfileIds = new Set(pending.map(p => p.house_id))
    const pendingProfiles = profiles?.filter(p => pendingProfileIds.has(p.id)) || []

    setStats({ total: 52, pending: pending.length, paid: paid.length, noData })
    setPendingHouses(pendingProfiles.slice(0, 8))
    setLoading(false)
  }

  if (loading) return <div className="loading-screen" style={{minHeight:'auto',padding:40}}><div className="spinner"/></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">{MONTHS[currentMonth-1]} {currentYear} — Resumen del condominio</p>
        </div>
        <Link to="/admin/casas" className="btn btn-primary"><Home size={15}/> Ver todas las casas</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Casas</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-sub">en el condominio</div>
        </div>
        <div className="stat-card" style={{borderLeft:'4px solid #c1121f'}}>
          <div className="stat-label">Pagos Pendientes</div>
          <div className="stat-value" style={{color:'#c1121f'}}>{stats.pending}</div>
          <div className="stat-sub">este mes</div>
        </div>
        <div className="stat-card" style={{borderLeft:'4px solid #2d6a4f'}}>
          <div className="stat-label">Pagos Realizados</div>
          <div className="stat-value" style={{color:'#2d6a4f'}}>{stats.paid}</div>
          <div className="stat-sub">este mes</div>
        </div>
        <div className="stat-card" style={{borderLeft:'4px solid #c9a84c'}}>
          <div className="stat-label">Sin Registro</div>
          <div className="stat-value" style={{color:'#c9a84c'}}>{stats.noData}</div>
          <div className="stat-sub">sin cargo este mes</div>
        </div>
      </div>

      <div className="card">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
          <h3 className="card-title" style={{marginBottom:0}}>Casas con Pagos Pendientes</h3>
          <Link to="/admin/casas" style={{fontSize:13,color:'#c9a84c',textDecoration:'none',fontWeight:600}}>Ver todas →</Link>
        </div>
        {pendingHouses.length === 0 ? (
          <div className="empty-state">
            <CheckCircle />
            <h3>¡Todo al día!</h3>
            <p>No hay pagos pendientes este mes</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Casa</th><th>Residente</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {pendingHouses.map(house => (
                  <tr key={house.id}>
                    <td><strong>Casa {house.house_number}</strong></td>
                    <td>{house.resident_name}</td>
                    <td><span className="badge badge-red"><AlertCircle size={11}/> Pendiente</span></td>
                    <td><Link to={`/admin/casas/${house.id}`} className="btn btn-sm btn-outline">Ver <ChevronRight size={13}/></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
