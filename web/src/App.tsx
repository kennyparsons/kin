import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { PeopleList } from './pages/PeopleList';

import { PersonForm } from './pages/PersonForm';
import { PersonDetail } from './pages/PersonDetail';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/people" element={<PeopleList />} />
        <Route path="/people/new" element={<PersonForm />} />
        <Route path="/people/:id" element={<PersonDetail />} />
        <Route path="/people/:id/edit" element={<PersonForm />} />
      </Routes>
    </Layout>
  );
}

export default App;
