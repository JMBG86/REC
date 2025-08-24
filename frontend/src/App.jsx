import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './App.css'

// Componentes
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import VehicleList from './components/VehicleList'
import VehicleDetail from './components/VehicleDetail'
import VehicleForm from './components/VehicleForm'
import Reports from './components/Reports'
import Users from './components/Users'
import EmailTriggers from './components/EmailTriggers'
import Layout from './components/Layout'

// Context para autenticação
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Componente para rotas protegidas
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  }
  
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/vehicles" element={
              <ProtectedRoute>
                <Layout>
                  <VehicleList />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/vehicles/new" element={
              <ProtectedRoute>
                <Layout>
                  <VehicleForm />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/vehicles/:id" element={
              <ProtectedRoute>
                <Layout>
                  <VehicleDetail />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/vehicles/:id/edit" element={
              <ProtectedRoute>
                <Layout>
                  <VehicleForm />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute>
                <Layout>
                  <Users />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/email-triggers" element={
              <ProtectedRoute>
                <Layout>
                  <EmailTriggers />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

