import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Plus, X, Users } from 'lucide-react'

export default function AdminResidents() {
  const [residents, setResidents] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ house_number: '', resident_name: '', email: '', password: '' })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchResidents() }, [])

  async function fetchResidents() {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'resident').order('house_number')
    setResidents(data || [])
    setLoading(false)
  }

  async function createResident() {
    if (!form.house_number || !form.resident_name || !form.email || !form.password)
      return toast.error('Completa todos los campos')
    if (form.password.length < 6) return toast.error('La contraseña debe tener al menos 6 caracteres')
    setSaving(true)

    // Create auth user via admin API - using signUp as workaround
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { house_number: Number(form.house_number), resident_name: form.resident_name, role: 'resident' }
      }
    })

    if (error) { toast.error(error.message); setSaving(false); return }

    // Insert profile
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        role: 'resident',
        house_number: Number(form.house_number),
        resident_name: form.resident_name,
        email: form.email
      })
    }

    toast.success(`Casa ${form.house_number} creada exitosamente`)
    setShowModal(false)
    setForm({ house_number: '', resident_name: '', email: '', password: '' })
    fetchResidents()
    setSaving(false)
  }

  if (loading) return <div className="loading-screen" style={{minHeight:'auto',padding:40}}><div className="spinner"/></div>

  const usedHouses = new Set(residents.map(r => r.house_number))
  const availableHouses = Array.from({length:52},(_,i)=>i+1).filter(n => !usedHouses.has(n))

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Residentes</h1>
          <p className="page-subtitle">{residents.length} de 52 casas registradas</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={15}/> Nuevo residente</button>
      </div>

      {residents.length === 0 ? (
        <div className="empty-state"><Users /><h3>Sin residentes registrados</h3><p>Crea el primer acceso de residente</p></div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Casa</th><th>Nombre</th><th>Correo</th><th>Estado</th></tr></thead>
              <tbody>
                {residents.map(r => (
                  <tr key={r.id}>
                    <td><strong>Casa {r.house_number}</strong></td>
                    <td>{r.resident_name}</td>
                    <td style={{color:'#8888aa'}}>{r.email}</td>
                    <td><span className="badge badge-green">Activo</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Nuevo Residente</h2>
              <button className="btn btn-icon btn-outline" onClick={() => setShowModal(false)}><X size={16}/></button>
            </div>
            <div className="form-group">
              <label className="form-label">Número de casa</label>
              <select className="form-select" value={form.house_number} onChange={e => setForm({...form, house_number: e.target.value})}>
                <option value="">Selecciona una casa</option>
                {availableHouses.map(n => <option key={n} value={n}>Casa {n}</option>)}
              </select>
              {availableHouses.length === 0 && <p style={{fontSize:12,color:'#c1121f',marginTop:4}}>Todas las casas ya tienen residente</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Nombre del residente</label>
              <input type="text" className="form-input" placeholder="Nombre completo" value={form.resident_name} onChange={e => setForm({...form, resident_name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <input type="email" className="form-input" placeholder="correo@ejemplo.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña inicial</label>
              <input type="password" className="form-input" placeholder="Mínimo 6 caracteres" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>
            <div style={{background:'#f5e6c0',borderRadius:8,padding:'10px 14px',fontSize:13,color:'#7a5c00',marginBottom:8}}>
              💡 Comparte el correo y contraseña con el residente para que pueda iniciar sesión.
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-gold" onClick={createResident} disabled={saving}>{saving ? 'Creando...' : 'Crear residente'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
