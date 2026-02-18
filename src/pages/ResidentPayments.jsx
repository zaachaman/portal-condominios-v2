import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Upload, FileText, X } from 'lucide-react'

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export default function ResidentPayments() {
  const { profile } = useAuth()
  const [payments, setPayments] = useState([])
  const [receipts, setReceipts] = useState([])
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear())
  const [showModal, setShowModal] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadPaymentId, setUploadPaymentId] = useState('')
  const [uploadNotes, setUploadNotes] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (profile) fetchData() }, [profile])

  async function fetchData() {
    const [{ data: pays }, { data: recs }] = await Promise.all([
      supabase.from('payments').select('*').eq('house_id', profile.id).order('year',{ascending:false}).order('month',{ascending:false}),
      supabase.from('receipts').select('*').eq('house_id', profile.id).order('uploaded_at',{ascending:false})
    ])
    setPayments(pays || [])
    setReceipts(recs || [])
    setLoading(false)
  }

  async function uploadReceipt() {
    if (!uploadFile) return toast.error('Selecciona un archivo')
    if (uploadFile.size > 10*1024*1024) return toast.error('El archivo no debe superar 10MB')
    setUploading(true)
    const fileName = `${Date.now()}-${uploadFile.name}`
    const path = `casa-${profile.house_number}/${fileName}`
    const { error } = await supabase.storage.from('receipts').upload(path, uploadFile)
    if (error) { toast.error('Error al subir archivo'); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('receipts').getPublicUrl(path)
    await supabase.from('receipts').insert({
      house_id: profile.id, payment_id: uploadPaymentId || null,
      file_url: publicUrl, file_name: uploadFile.name,
      uploaded_by: 'resident', notes: uploadNotes
    })
    toast.success('Recibo enviado correctamente ✅')
    setShowModal(false); setUploadFile(null); setUploadNotes(''); setUploadPaymentId('')
    fetchData(); setUploading(false)
  }

  const filtered = payments.filter(p => p.year === yearFilter)
  const years = [...new Set(payments.map(p => p.year))].sort((a,b)=>b-a)
  if (!years.includes(new Date().getFullYear())) years.unshift(new Date().getFullYear())

  if (loading) return <div className="loading-screen" style={{minHeight:'auto',padding:40}}><div className="spinner"/></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Mis Pagos</h1>
          <p className="page-subtitle">Casa {profile?.house_number}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Upload size={15}/> Subir recibo</button>
      </div>

      <div className="filters-bar">
        <select className="filter-select" value={yearFilter} onChange={e => setYearFilter(Number(e.target.value))}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="card" style={{marginBottom:20}}>
        <h3 className="card-title">Historial {yearFilter}</h3>
        {filtered.length === 0 ? (
          <div className="empty-state" style={{padding:'30px 0'}}><h3>Sin pagos en {yearFilter}</h3></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Mes</th><th>Descripción</th><th>Monto</th><th>Estado</th></tr></thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>{MONTHS[p.month-1]}</td>
                    <td>{p.description}</td>
                    <td><strong>Q{Number(p.amount).toFixed(2)}</strong></td>
                    <td><span className={`badge ${p.status==='paid'?'badge-green':'badge-red'}`}>{p.status==='paid'?'Pagado':'Pendiente'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {receipts.length > 0 && (
        <div className="card">
          <h3 className="card-title">Mis Recibos</h3>
          {receipts.map(r => (
            <div key={r.id} className="receipt-item">
              <FileText size={16} style={{color:'#c9a84c',flexShrink:0}} />
              <div style={{flex:1}}>
                <a href={r.file_url} target="_blank" rel="noopener noreferrer">{r.file_name}</a>
                {r.notes && <div style={{fontSize:12,color:'#8888aa',marginTop:2}}>{r.notes}</div>}
              </div>
              <span style={{fontSize:12,color:'#8888aa'}}>{new Date(r.uploaded_at).toLocaleDateString('es-GT')}</span>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Subir Comprobante</h2>
              <button className="btn btn-icon btn-outline" onClick={() => setShowModal(false)}><X size={16}/></button>
            </div>
            <div className="form-group">
              <label className="form-label">Archivo (PDF o imagen, máx. 10MB)</label>
              <div className="file-upload-area" onClick={() => document.getElementById('resident-file-input').click()}>
                <Upload size={28} style={{margin:'0 auto',color:'#c9a84c',display:'block'}} />
                <p>{uploadFile ? uploadFile.name : 'Toca para seleccionar tu comprobante'}</p>
              </div>
              <input id="resident-file-input" type="file" accept=".pdf,image/*" style={{display:'none'}} onChange={e => setUploadFile(e.target.files[0])} />
            </div>
            <div className="form-group">
              <label className="form-label">¿A qué pago corresponde?</label>
              <select className="form-select" value={uploadPaymentId} onChange={e => setUploadPaymentId(e.target.value)}>
                <option value="">Selecciona un pago (opcional)</option>
                {payments.filter(p=>p.status==='pending').map(p => (
                  <option key={p.id} value={p.id}>{MONTHS[p.month-1]} {p.year} — {p.description} (Q{Number(p.amount).toFixed(2)})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Notas (opcional)</label>
              <textarea className="form-textarea" placeholder="Ej: Pagué con transferencia el día 5..." value={uploadNotes} onChange={e => setUploadNotes(e.target.value)} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-gold" onClick={uploadReceipt} disabled={uploading}>{uploading ? 'Subiendo...' : 'Enviar comprobante'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
