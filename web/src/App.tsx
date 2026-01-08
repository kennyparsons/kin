import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { PeopleList } from './pages/PeopleList';
import { PersonForm } from './pages/PersonForm';
import { PersonDetail } from './pages/PersonDetail';
import { Login } from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-gray-500">Loading session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={
        <RequireAuth>
          <Layout>
            <Dashboard />
          </Layout>
        </RequireAuth>
      } />
      
      <Route path="/people" element={
        <RequireAuth>
          <Layout>
            <PeopleList />
          </Layout>
        </RequireAuth>
      } />
      
      <Route path="/people/new" element={
        <RequireAuth>
          <Layout>
            <PersonForm />
          </Layout>
        </RequireAuth>
      } />
      
      <Route path="/people/:id" element={
        <RequireAuth>
          <Layout>
            <PersonDetail />
          </Layout>
        </RequireAuth>
      } />
      
      <Route path="/people/:id/edit" element={
        <RequireAuth>
          <Layout>
            <PersonForm />
          </Layout>
        </RequireAuth>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;