import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/AppShell.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Alunos from './pages/Alunos.jsx'
import Professores from './pages/Professores.jsx'
import Series from './pages/Series.jsx'
import Turmas from './pages/Turmas.jsx'
import Materias from './pages/Materias.jsx'
import Vinculos from './pages/Vinculos.jsx'
import Avaliacoes from './pages/Avaliacoes.jsx'
import Notas from './pages/Notas.jsx'
import Chamada from './pages/Chamada.jsx'
import Boletim from './pages/Boletim.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/alunos" element={<Alunos />} />
          <Route path="/professores" element={<Professores />} />
          <Route path="/series" element={<Series />} />
          <Route path="/turmas" element={<Turmas />} />
          <Route path="/materias" element={<Materias />} />
          <Route path="/vinculos" element={<Vinculos />} />
          <Route path="/avaliacoes" element={<Avaliacoes />} />
          <Route path="/notas" element={<Notas />} />
          <Route path="/chamada" element={<Chamada />} />
          <Route path="/boletim" element={<Boletim />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}
