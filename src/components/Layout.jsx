import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  LayoutDashboard, Home, Megaphone, Users, History,
  LogOut, Menu, X, ChevronRight
} from 'lucide-react'

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export default function Layout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isAdmin = profile?.role === 'admin'

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/casas', icon: Home, label: 'Casas' },
    { to: '/admin/historial', icon: History, label: 'Historial de Pagos' },
    { to: '/admin/anuncios', icon: Megaphone, label: 'Anuncios' },
    { to: '/admin/residentes', icon: Users, label: 'Residentes' },
  ]
  const residentLinks = [
    { to: '/residente', icon: LayoutDashboard, label: 'Mi Dashboard', end: true },
    { to: '/residente/pagos', icon: History, label: 'Mis Pagos' },
    { to: '/residente/anuncios', icon: Megaphone, label: 'Anuncios' },
  ]
  const links = isAdmin ? adminLinks : residentLinks

  const handleLogout = async () => {
    await signOut()
    toast.success('Sesión cerrada')
    navigate('/login')
  }

  const now = new Date()
  const pageTitle = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {sidebarOpen && <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:99}} onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h1>Condominio<br/>del Valle 2</h1>
          <span>{isAdmin ? 'Panel Admin' : `Casa ${profile?.house_number}`}</span>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section-title">Menú</div>
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item" onClick={handleLogout} style={{color:'rgba(255,255,255,0.5)'}}>
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="top-bar">
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <button className="btn btn-icon btn-outline" style={{display:'none'}} id="menu-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={18} />
            </button>
            <button className="btn btn-icon btn-outline" style={{border:'none',background:'none'}} onClick={() => setSidebarOpen(true)}>
              <Menu size={18} />
            </button>
            <h2>{pageTitle}</h2>
          </div>
          <div className="top-bar-right">
            <div className="user-badge">
              <div className="user-avatar">{isAdmin ? 'A' : profile?.house_number}</div>
              <span>{isAdmin ? 'Administrador' : profile?.resident_name?.split(' ')[0] || 'Residente'}</span>
            </div>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
