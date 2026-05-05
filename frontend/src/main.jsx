import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from './auth/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import MainLayout from './layouts/MainLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AuditList from './pages/audits/AuditList';
import AuditForm from './pages/audits/AuditForm';
import FormList from './pages/forms/FormList';
import FormBuilder from './pages/forms/FormBuilder';
import UserList from './pages/admin/UserList';
import RoleList from './pages/admin/RoleList';
import MasterData from './pages/admin/MasterData';
import BitacoraHome from './pages/bitacora/BitacoraHome';
import HistorialPaciente from './pages/bitacora/HistorialPaciente';
import BitacoraAdmin from './pages/bitacora/BitacoraAdmin';

import './index.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 60_000 } },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
              <Route index element={<Dashboard />} />

              {/* Audits */}
              <Route path="audits" element={<PrivateRoute permission="audits:read"><AuditList /></PrivateRoute>} />
              <Route path="audits/new" element={<PrivateRoute permission="audits:write"><AuditForm /></PrivateRoute>} />
              <Route path="audits/:id" element={<PrivateRoute permission="audits:read"><AuditForm /></PrivateRoute>} />

              {/* Forms */}
              <Route path="forms" element={<PrivateRoute permission="forms:read"><FormList /></PrivateRoute>} />
              <Route path="forms/new" element={<PrivateRoute permission="forms:write"><FormBuilder /></PrivateRoute>} />
              <Route path="forms/:id" element={<PrivateRoute permission="forms:write"><FormBuilder /></PrivateRoute>} />

              {/* Admin */}
              <Route path="admin/users"  element={<PrivateRoute permission="users:read"><UserList /></PrivateRoute>} />
              <Route path="admin/roles"  element={<PrivateRoute permission="roles:read"><RoleList /></PrivateRoute>} />
              <Route path="admin/master" element={<PrivateRoute permission="master:read"><MasterData /></PrivateRoute>} />

              {/* Bitácora de Internos */}
              <Route path="bitacora" element={<PrivateRoute permission="bitacora:read"><BitacoraHome /></PrivateRoute>} />
              <Route path="bitacora/historial/:hash" element={<PrivateRoute permission="bitacora:historial"><HistorialPaciente /></PrivateRoute>} />
              <Route path="bitacora/admin" element={<PrivateRoute permission="bitacora:admin"><BitacoraAdmin /></PrivateRoute>} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
