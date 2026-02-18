import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Limpiar tokens corruptos de Supabase antes de arrancar
try {
  Object.keys(localStorage)
    .filter(k => k.startsWith('sb-'))
    .forEach(k => {
      try {
        const val = localStorage.getItem(k)
        if (!val || val === 'undefined' || val === 'null') {
          localStorage.removeItem(k)
        } else {
          JSON.parse(val)
        }
      } catch {
        localStorage.removeItem(k)
      }
    })
} catch {}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
