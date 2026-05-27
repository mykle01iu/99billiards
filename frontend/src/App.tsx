import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Tables from './pages/Tables'
import Services from './pages/Services'
import Invoices from './pages/Invoices'
import Layout from './components/Layout'

function App() {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={token ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="employees" element={token && role === 'admin' ? <Employees /> : <Navigate to="/" />} />
          <Route path="tables" element={<Tables />} />
          <Route path="services" element={token && role === 'admin' ? <Services /> : <Navigate to="/" />} />
          <Route path="invoices" element={<Invoices />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App