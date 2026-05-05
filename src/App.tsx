import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import TeamBuilder from './pages/TeamBuilder'
import ThreatMatrix from './pages/ThreatMatrix'
import LiveSimulator from './pages/LiveSimulator'
import TypeSynergy from './pages/TypeSynergy'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<TeamBuilder />} />
          <Route path="synergy" element={<TypeSynergy />} />
          <Route path="threats" element={<ThreatMatrix />} />
          <Route path="simulator" element={<LiveSimulator />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
