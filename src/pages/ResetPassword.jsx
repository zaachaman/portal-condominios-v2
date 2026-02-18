import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { KeyRound } from 'lucide-react'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase puts the token in the URL hash — just check we have a session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
      else {
        toast.error('Link inválido o expirado')
        navigate('/login')
      }
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 6) return toast.error('La contraseña debe tener al menos 6 caracteres')
    if (password !== confirm) return toast.error('Las contraseñas no coinciden')
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      toast.error('Error al cambiar la contraseña')
      setLoading(false)
      return
    }
    toast.success('¡Contraseña actualizada!')
    // Get profile to redirect correctly
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    navigate(profile?.role === 'admin' ? '/admin' : '/residente')
  }

  if (!ready) return <div className="loading-screen"><div className="spinner"/></div>

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-branding">
          <div style={{fontSize:64,marginBottom:12}}>🏘️</div>
          <h1>Condominio<br/>del Valle 2</h1>
          <div className="login-gold-line" />
          <p>Portal de administración<br/>y pagos residencial</p>
        </div>
      </div>
      <div className="login-right">
        <div className="login-form-wrap">
          <h2>Nueva contraseña</h2>
          <p>Elige una contraseña segura para tu cuenta</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nueva contraseña</label>
              <input
                type="password" className="form-input"
                placeholder="Mínimo 6 caracteres"
                value={password} onChange={e => setPassword(e.target.value)}
                required autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirmar contraseña</label>
              <input
                type="password" className="form-input"
                placeholder="Repite tu contraseña"
                value={confirm} onChange={e => setConfirm(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{width:'100%', justifyContent:'center', marginTop:8}}
              disabled={loading}
            >
              {loading
                ? <span className="spinner" style={{width:18,height:18,borderWidth:2}} />
                : <><KeyRound size={16}/> Guardar contraseña</>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
