import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { PeopleList } from './pages/PeopleList';
import { PersonDetail } from './pages/PersonDetail';
import { PersonForm } from './pages/PersonForm';
import { Reminders } from './pages/Reminders';
import { InteractionLog } from './pages/InteractionLog';
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
      
          <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/reminders" element={<RequireAuth><Reminders /></RequireAuth>} />
          <Route path="/interactions" element={<RequireAuth><InteractionLog /></RequireAuth>} />
          <Route path="/people" element={<RequireAuth><PeopleList /></RequireAuth>} />
      
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