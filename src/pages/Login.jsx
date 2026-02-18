import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { LogIn } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      toast.error('Correo o contraseña incorrectos')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    toast.success('¡Bienvenido!')
    
    if (profile?.role === 'admin') {
      navigate('/admin', { replace: true })
    } else {
      navigate('/residente', { replace: true })
    }
  }

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
          <h2>Bienvenido</h2>
          <p>Ingresa tus credenciales para acceder a tu portal</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <input
                type="email" className="form-input"
                placeholder="tu@correo.com"
                value={email} onChange={e => setEmail(e.target.value)}
                required autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                type="password" className="form-input"
                placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
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
                : <><LogIn size={16}/> Ingresar</>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
