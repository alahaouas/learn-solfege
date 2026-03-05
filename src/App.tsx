import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';
import Onboarding from '@/pages/Onboarding';
import Dashboard from '@/pages/Dashboard';
import ScoreReader from '@/pages/ScoreReader';
import ScoreEditor from '@/pages/ScoreEditor';
import Exercises from '@/pages/Exercises';
import Theory from '@/pages/Theory';
import Layout from '@/components/ui/Layout';

function App() {
  const onboardingCompleted = useUserStore((s) => s.onboardingCompleted);

  return (
    <BrowserRouter>
      <Routes>
        {/* Onboarding — toujours accessible si pas encore complété */}
        <Route path="/onboarding" element={<Onboarding />} />

        {/* App principale */}
        <Route
          path="/"
          element={
            onboardingCompleted ? <Layout /> : <Navigate to="/onboarding" replace />
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="lire" element={<ScoreReader />} />
          <Route path="lire/:scoreId" element={<ScoreReader />} />
          <Route path="editer" element={<ScoreEditor />} />
          <Route path="editer/:scoreId" element={<ScoreEditor />} />
          <Route path="exercices" element={<Exercises />} />
          <Route path="theorie" element={<Theory />} />
        </Route>

        {/* Catch-all */}
        <Route
          path="*"
          element={<Navigate to={onboardingCompleted ? '/' : '/onboarding'} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
