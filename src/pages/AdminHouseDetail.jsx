import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { ArrowLeft, Plus, Upload, CheckCircle, XCircle, FileText, Trash2, X } from 'lucide-react'

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export default function AdminHouseDetail() {
  const { id } = useParams()
  const [house, setHouse] = useState(null)
  const [payments, setPayments] = useState([])
  const [receipts, setReceipts] = useState([])
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear())
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), amount: '', description: '', status: 'pending' })
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadNotes, setUploadNotes] = useState('')
  const [uploadPaymentId, setUploadPaymentId] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchData() }, [id])

  async function fetchData() {
    const [{ data: profile }, { data: pays }, { data: recs }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('payments').select('*').eq('house_id', id).order('year', { ascending: false }).order('month', { ascending: false }),
      supabase.from('receipts').select('*').eq('house_id', id).order('uploaded_at', { ascending: false })
    ])
    setHouse(profile)
    setPayments(pays || [])
    setReceipts(recs || [])
    setLoading(false)
  }

  const filteredPayments = payments.filter(p => p.year === yearFilter)

  async function savePayment() {
    if (!form.amount || !form.description) return toast.error('Completa todos los campos')
    setSaving(true)
    const { error } = await supabase.from('payments').insert({
      house_id: id, month: Number(form.month), year: Number(form.year),
      amount: Number(form.amount), description: form.description, status: form.status
    })
    if (error) toast.error('Error al guardar')
    else { toast.success('Cargo agregado'); setShowPaymentModal(false); fetchData() }
    setSaving(false)
  }

  async function toggleStatus(payment) {
    const newStatus = payment.status === 'paid' ? 'pending' : 'paid'
    const { error } = await supabase.from('payments').update({ status: newStatus }).eq('id', payment.id)
    if (error) toast.error('Error al actualizar')
    else { toast.success(newStatus === 'paid' ? '¡Marcado como pagado!' : 'Marcado como pendiente'); fetchData() }
  }

  async function deletePayment(paymentId) {
    if (!confirm('¿Eliminar este pago?')) return
    await supabase.from('payments').delete().eq('id', paymentId)
    toast.success('Pago eliminado')
    fetchData()
  }

  async function uploadReceipt() {
    if (!uploadFile) return toast.error('Selecciona un archivo')
    if (uploadFile.size > 10 * 1024 * 1024) return toast.error('El archivo no debe superar 10MB')
    setUploading(true)
    const fileName = `${Date.now()}-${uploadFile.name}`
    const path = `casa-${house.house_number}/${fileName}`
    const { error: uploadError } = await supabase.storage.from('receipts').upload(path, uploadFile)
    if (uploadError) { toast.error('Error al subir archivo'); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('receipts').getPublicUrl(path)
    await supabase.from('receipts').insert({
      house_id: id, payment_id: uploadPaymentId || null,
      file_url: publicUrl, file_name: uploadFile.name,
      uploaded_by: 'admin', notes: uploadNotes
    })
    toast.success('Recibo subido correctamente')
    setShowUploadModal(false)
    setUploadFile(null); setUploadNotes(''); setUploadPaymentId('')
    fetchData()
    setUploading(false)
  }

  async function deleteReceipt(receipt) {
    if (!confirm('¿Eliminar este recibo?')) return
    await supabase.from('receipts').delete().eq('id', receipt.id)
    toast.success('Recibo eliminado')
    fetchData()
  }

  const years = [...new Set(payments.map(p => p.year))].sort((a,b) => b-a)
  if (!years.includes(new Date().getFullYear())) years.unshift(new Date().getFullYear())

  if (loading) return <div className="loading-screen" style={{minHeight:'auto',padding:40}}><div className="spinner"/></div>
  if (!house) return <div className="empty-state"><h3>Casa no encontrada</h3></div>

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <Link to="/admin/casas" className="btn btn-icon btn-outline"><ArrowLeft size={16}/></Link>
        <div>
          <h1 className="page-title" style={{fontSize:24}}>Casa {house.house_number}</h1>
          <p className="page-subtitle">{house.resident_name} · {house.email}</p>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:24}}>
        {/* Payments */}
        <div className="card" style={{gridColumn:'1/-1'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
            <h3 className="card-title" style={{marginBottom:0}}>Historial de Pagos</h3>
            <div style={{display:'flex',gap:8}}>
              <select className="filter-select" value={yearFilter} onChange={e => setYearFilter(Number(e.target.value))}>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <button className="btn btn-gold btn-sm" onClick={() => setShowPaymentModal(true)}><Plus size={14}/> Agregar</button>
            </div>
          </div>
          {filteredPayments.length === 0 ? (
            <div className="empty-state" style={{padding:'30px 0'}}><h3>Sin pagos en {yearFilter}</h3></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Mes</th><th>Descripción</th><th>Monto</th><th>Estado</th><th>Acciones</th></tr></thead>
                <tbody>
                  {filteredPayments.map(p => (
                    <tr key={p.id}>
                      <td>{MONTHS[p.month - 1]}</td>
                      <td>{p.description}</td>
                      <td><strong>Q{Number(p.amount).toFixed(2)}</strong></td>
                      <td>
                        <span className={`badge ${p.status === 'paid' ? 'badge-green' : 'badge-red'}`}>
                          {p.status === 'paid' ? 'Pagado' : 'Pendiente'}
                        </span>
                      </td>
                      <td>
                        <div style={{display:'flex',gap:6}}>
                          <button className="btn btn-sm btn-outline" onClick={() => toggleStatus(p)}>
                            {p.status === 'paid' ? <XCircle size={13}/> : <CheckCircle size={13}/>}
                            {p.status === 'paid' ? ' Pendiente' : ' Pagado'}
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => deletePayment(p.id)}><Trash2 size={13}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Receipts */}
        <div className="card" style={{gridColumn:'1/-1'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
            <h3 className="card-title" style={{marginBottom:0}}>Recibos</h3>
            <button className="btn btn-outline btn-sm" onClick={() => setShowUploadModal(true)}><Upload size={14}/> Subir recibo</button>
          </div>
          {receipts.length === 0 ? (
            <div className="empty-state" style={{padding:'30px 0'}}><h3>Sin recibos</h3></div>
          ) : (
            receipts.map(r => (
              <div key={r.id} className="receipt-item">
                <FileText size={16} style={{color:'#c9a84c',flexShrink:0}} />
                <div style={{flex:1}}>
                  <a href={r.file_url} target="_blank" rel="noopener noreferrer">{r.file_name}</a>
                  {r.notes && <div style={{fontSize:12,color:'#8888aa',marginTop:2}}>{r.notes}</div>}
                </div>
                <span className={`tag ${r.uploaded_by === 'admin' ? 'tag-admin' : ''}`}>{r.uploaded_by === 'admin' ? 'Admin' : 'Residente'}</span>
                <button className="btn btn-icon btn-danger btn-sm" onClick={() => deleteReceipt(r)}><Trash2 size={13}/></button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Agregar Cargo</h2>
              <button className="btn btn-icon btn-outline" onClick={() => setShowPaymentModal(false)}><X size={16}/></button>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Mes</label>
                <select className="form-select" value={form.month} onChange={e => setForm({...form, month: e.target.value})}>
                  {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Año</label>
                <input type="number" className="form-input" value={form.year} onChange={e => setForm({...form, year: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Descripción</label>
              <input type="text" className="form-input" placeholder="Ej: Cuota mensual mantenimiento" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Monto (Q)</label>
                <input type="number" className="form-input" placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Estado inicial</label>
                <select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  <option value="pending">Pendiente</option>
                  <option value="paid">Pagado</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowPaymentModal(false)}>Cancelar</button>
              <button className="btn btn-gold" onClick={savePayment} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cargo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Receipt Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Subir Recibo</h2>
              <button className="btn btn-icon btn-outline" onClick={() => setShowUploadModal(false)}><X size={16}/></button>
            </div>
            <div className="form-group">
              <label className="form-label">Archivo (PDF o imagen, máx. 10MB)</label>
              <div className="file-upload-area" onClick={() => document.getElementById('admin-file-input').click()}>
                <Upload size={28} style={{margin:'0 auto',color:'#c9a84c',display:'block'}} />
                <p>{uploadFile ? uploadFile.name : 'Haz clic para seleccionar archivo'}</p>
              </div>
              <input id="admin-file-input" type="file" accept=".pdf,image/*" style={{display:'none'}} onChange={e => setUploadFile(e.target.files[0])} />
            </div>
            <div className="form-group">
              <label className="form-label">Asociar a pago (opcional)</label>
              <select className="form-select" value={uploadPaymentId} onChange={e => setUploadPaymentId(e.target.value)}>
                <option value="">Sin asociar</option>
                {payments.map(p => <option key={p.id} value={p.id}>{MONTHS[p.month-1]} {p.year} — {p.description}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Notas (opcional)</label>
              <textarea className="form-textarea" placeholder="Observaciones..." value={uploadNotes} onChange={e => setUploadNotes(e.target.value)} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowUploadModal(false)}>Cancelar</button>
              <button className="btn btn-gold" onClick={uploadReceipt} disabled={uploading}>
                {uploading ? 'Subiendo...' : 'Subir recibo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
