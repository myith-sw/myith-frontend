import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ApplicationProvider } from './app/ApplicationContext.tsx'
import { AuthProvider } from './auth/AuthContext.tsx'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ApplicationProvider>
          <App />
        </ApplicationProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
