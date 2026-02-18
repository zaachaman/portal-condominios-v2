import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export default function AdminPaymentHistory() {
  const [payments, setPayments] = useState([])
  const [profiles, setProfiles] = useState({})
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear())
  const [monthFilter, setMonthFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [yearFilter])

  async function fetchData() {
    const [{ data: pays }, { data: profs }] = await Promise.all([
      supabase.from('payments').select('*').eq('year', yearFilter).order('month', { ascending: false }),
      supabase.from('profiles').select('*').eq('role', 'resident')
    ])
    setPayments(pays || [])
    const map = {}
    profs?.forEach(p => { map[p.id] = p })
    setProfiles(map)
    setLoading(false)
  }

  const filtered = payments.filter(p => {
    const matchMonth = !monthFilter || p.month === Number(monthFilter)
    const matchStatus = !statusFilter || p.status === statusFilter
    return matchMonth && matchStatus
  })

  const totalPaid = filtered.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0)
  const totalPending = filtered.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0)

  const years = [2024, 2025, 2026, 2027]

  if (loading) return <div className="loading-screen" style={{minHeight:'auto',padding:40}}><div className="spinner"/></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Historial de Pagos</h1>
          <p className="page-subtitle">Vista global de todos los pagos</p>
        </div>
      </div>

      <div className="stats-grid" style={{gridTemplateColumns:'1fr 1fr',maxWidth:480,marginBottom:24}}>
        <div className="stat-card" style={{borderLeft:'4px solid #2d6a4f'}}>
          <div className="stat-label">Total Cobrado</div>
          <div className="stat-value" style={{color:'#2d6a4f',fontSize:28}}>Q{totalPaid.toFixed(2)}</div>
        </div>
        <div className="stat-card" style={{borderLeft:'4px solid #c1121f'}}>
          <div className="stat-label">Total Pendiente</div>
          <div className="stat-value" style={{color:'#c1121f',fontSize:28}}>Q{totalPending.toFixed(2)}</div>
        </div>
      </div>

      <div className="filters-bar">
        <select className="filter-select" value={yearFilter} onChange={e => setYearFilter(Number(e.target.value))}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select className="filter-select" value={monthFilter} onChange={e => setMonthFilter(e.target.value)}>
          <option value="">Todos los meses</option>
          {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
        </select>
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="paid">Pagado</option>
          <option value="pending">Pendiente</option>
        </select>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state"><h3>Sin pagos con estos filtros</h3></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Casa</th><th>Residente</th><th>Mes</th><th>Descripción</th><th>Monto</th><th>Estado</th></tr></thead>
              <tbody>
                {filtered.map(p => {
                  const h = profiles[p.house_id]
                  return (
                    <tr key={p.id}>
                      <td><Link to={`/admin/casas/${p.house_id}`} className="table-link">Casa {h?.house_number || '?'}</Link></td>
                      <td>{h?.resident_name || '—'}</td>
                      <td>{MONTHS[p.month - 1]}</td>
                      <td>{p.description}</td>
                      <td><strong>Q{Number(p.amount).toFixed(2)}</strong></td>
                      <td><span className={`badge ${p.status === 'paid' ? 'badge-green' : 'badge-red'}`}>{p.status === 'paid' ? 'Pagado' : 'Pendiente'}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
