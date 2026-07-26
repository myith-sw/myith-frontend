import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ApplicationProvider } from './app/ApplicationContext.tsx'
import { AuthProvider } from './auth/AuthContext.tsx'
import './index.css'
import App from './App.tsx'

const router = createBrowserRouter([{ element: <App />, path: '*' }])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ApplicationProvider>
        <RouterProvider router={router} />
      </ApplicationProvider>
    </AuthProvider>
  </StrictMode>,
)
