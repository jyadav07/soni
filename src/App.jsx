import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
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
        {/* Public — no nav chrome */}
        <Route path="/s/:slug" element={<SharePage />} />
        <Route path="/login" element={<Login />} />

        {/* App shell with nav */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/create" element={<CreateItem />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
