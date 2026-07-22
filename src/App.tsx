import { AppShell } from './components/AppShell'
import { EggSelectionHome } from './components/EggSelectionHome'
import { Sidebar } from './components/Sidebar'

function App() {
  return (
    <AppShell sidebar={<Sidebar />}>
      <EggSelectionHome />
    </AppShell>
  )
}

export default App
