import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/tailwind.css'

// This is the only demo adapter entry point; feature services contain no sample-data logic.
if ((import.meta.env.VITE_API_MODE || 'demo') === 'demo') {
  await import('./demo/installDemo.js')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
