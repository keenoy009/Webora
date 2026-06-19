import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import AuthPage from './pages/AuthPage'
import EditorPage from './pages/EditorPage'
import ProjectsPage from './pages/ProjectsPage'
import PricingPage from './pages/PricingPage'
import CommunityPage from './pages/CommunityPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/community" element={<CommunityPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App