import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Search } from 'lucide-react'

export default function AdminHouses() {
  const [houses, setHouses] = useState([])
  const [payments, setPayments] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const [{ data: profiles }, { data: pays }] = await Promise.all([
      supabase.from('profiles').select('*').eq('role', 'resident').order('house_number'),
      supabase.from('payments').select('*').eq('month', currentMonth).eq('year', currentYear)
    ])
    setHouses(profiles || [])
    setPayments(pays || [])
    setLoading(false)
  }

  function getStatus(houseId) {
    const p = payments.find(p => p.house_id === houseId)
    if (!p) return 'none'
    return p.status
  }

  const filtered = houses.filter(h => {
    const matchSearch = h.resident_name?.toLowerCase().includes(search.toLowerCase()) || String(h.house_number).includes(search)
    const status = getStatus(h.id)
    const matchFilter = filter === 'all' || filter === status
    return matchSearch && matchFilter
  })

  if (loading) return <div className="loading-screen" style={{minHeight:'auto',padding:40}}><div className="spinner"/></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Casas</h1>
          <p className="page-subtitle">52 casas en el condominio</p>
        </div>
      </div>

      <div className="filters-bar">
        <div style={{position:'relative',flex:1,maxWidth:280}}>
          <Search size={14} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#8888aa'}}/>
          <input className="form-input" style={{paddingLeft:32}} placeholder="Buscar casa o residente..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">Todos</option>
          <option value="pending">Pendientes</option>
          <option value="paid">Pagados</option>
          <option value="none">Sin cargo</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><h3>No se encontraron casas</h3></div>
      ) : (
        <div className="houses-grid">
          {filtered.map(house => {
            const status = getStatus(house.id)
            return (
              <Link key={house.id} to={`/admin/casas/${house.id}`} className={`house-card ${status === 'pending' ? 'pending' : status === 'paid' ? 'paid' : ''}`}>
                <div className="house-number">{house.house_number}</div>
                <div className="house-name">{house.resident_name || 'Sin nombre'}</div>
                {status === 'paid' && <span className="badge badge-green">Pagado</span>}
                {status === 'pending' && <span className="badge badge-red">Pendiente</span>}
                {status === 'none' && <span className="badge badge-gold">Sin cargo</span>}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
