
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ResumeBuilder from "./pages/ResumeBuilder";
import JobTracker from "./pages/JobTracker";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import CareerAssistant from "./pages/CareerAssistant";

import AppLayout from "./components/AppLayout";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        {/* Default route */}
        <Route
          path="/"
          element={<Navigate to="/register" replace />}
        />

        {/* Authentication pages — no sidebar */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Main CareerPilot application */}
        <Route element={<AppLayout />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/resume-builder"
            element={<ResumeBuilder />}
          />

          <Route
            path="/job-tracker"
            element={<JobTracker />}
          />

          <Route
            path="/resume-analyzer"
            element={<ResumeAnalyzer />}
          />

          <Route
            path="/career-assistant"
            element={<CareerAssistant />}
          />
        </Route>

        {/* Unknown routes */}
        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
