import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import CreateItem from './pages/CreateItem'
import SharePage from './pages/SharePage'
import Dashboard from './pages/Dashboard'

function AppLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public share page — no nav chrome */}
        <Route path="/s/:slug" element={<SharePage />} />

        {/* App shell with nav */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateItem />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
