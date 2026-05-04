
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Collection from './pages/Collection';
import BookViewer from './pages/BookViewer';
import Directory from './pages/Directory';
import AlumniPage from './pages/Alumni';
import { ClassList, StudentList } from './pages/AlumniHierarchy';
import SchoolInfo from './pages/SchoolInfo';
import GlobalSearch from './pages/GlobalSearch';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminAlumni from './pages/AdminAlumni';
import AdminSchool from './pages/AdminSchool';
import AdminTeachers from './pages/AdminTeachers';
import AdminSettings from './pages/AdminSettings';
import AdminFlipbook from './pages/AdminFlipbook';
import AdminYearbooks from './pages/AdminYearbooks';
import { useVisitorTracking } from './lib/tracking';
import { ForcePasswordChange } from './components/ForcePasswordChange';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, authReady, dbConnected, requiresPasswordChange } = useApp();
  if (!authReady) return <div className="p-12 text-center">Memuat...</div>;
  if (isAdmin && dbConnected && requiresPasswordChange) return <ForcePasswordChange />;
  return isAdmin ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  useVisitorTracking();
  return (
    <Routes>
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/koleksi" element={<Layout><Collection /></Layout>} />
      <Route path="/buku/:id" element={<BookViewer />} />
      <Route path="/sekolah" element={<Layout><SchoolInfo /></Layout>} />
      <Route path="/guru" element={<Layout><Directory /></Layout>} />
      <Route path="/angkatan" element={<Layout><AlumniPage /></Layout>} />
      <Route path="/angkatan/:year" element={<Layout><ClassList /></Layout>} />
      <Route path="/angkatan/:year/:className" element={<Layout><StudentList /></Layout>} />
      <Route path="/alumni" element={<Navigate to="/angkatan" />} />
      <Route path="/cari" element={<Layout><GlobalSearch /></Layout>} />
      <Route path="/login" element={<Layout><Login /></Layout>} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminLayout><AdminDashboard /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/alumni" element={
        <ProtectedRoute>
          <AdminLayout><AdminAlumni /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/sekolah" element={
        <ProtectedRoute>
          <AdminLayout><AdminSchool /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/guru" element={
        <ProtectedRoute>
          <AdminLayout><AdminTeachers /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute>
          <AdminLayout><AdminSettings /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/flipbook" element={
        <ProtectedRoute>
          <AdminLayout><AdminFlipbook /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/manage-books" element={
        <ProtectedRoute>
          <AdminLayout><AdminYearbooks /></AdminLayout>
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
}

export default App;
