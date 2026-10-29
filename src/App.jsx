import { useContext, useEffect, useRef } from "react";
import {
  HashRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { TodoProvider } from "./context/TodoProvider.jsx";
import { ThemeProvider } from "./context/ThemeProvider.jsx";
import { ThemeContext } from "./context/ThemeContext.js";
import LearningProgressProvider from "./context/LearningProgressProvider.jsx";
import ThemeSwitcher from "./components/ThemeSwitcher.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Courses from "./pages/Courses.jsx";
import CourseDetails from "./pages/CourseDetails.jsx";
import Modules from "./pages/Modules.jsx";
import Lesson from "./pages/Lesson.jsx";
import NotFound from "./pages/NotFound.jsx";
import "./App.css";

function Platform() {
  const { theme } = useContext(ThemeContext);
  const { pathname } = useLocation();
  const mainRef = useRef(null);

  useEffect(() => {
    mainRef.current?.focus();
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app" data-theme={theme}>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          mainRef.current?.focus();
        }}
      >
        Hopp til innhold
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" to="/" aria-label="EduPlan dashboard">
            <span className="brand-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M12 6v15M3 4c3-1 6 0 9 2 3-2 6-3 9-2v14c-3-1-6 0-9 2-3-2-6-3-9-2Z" />
              </svg>
            </span>
            <span className="brand-name">
              EduPlan<span className="brand-dot">.</span>
            </span>
          </Link>
          <nav className="main-nav" aria-label="Hovednavigasjon">
            <NavLink to="/" end>Dashboard</NavLink>
            <NavLink to="/kurs">Kursoversikt</NavLink>
          </nav>
          <ThemeSwitcher />
        </div>
      </header>

      <main
        id="main-content"
        className="main-content"
        ref={mainRef}
        tabIndex={-1}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/kurs" element={<Courses />} />
          <Route path="/kurs/:courseId" element={<CourseDetails />} />
          <Route path="/kurs/:courseId/moduler" element={<Modules />} />
          <Route path="/kurs/:courseId/moduler/:moduleId" element={<Modules />} />
          <Route
            path="/kurs/:courseId/moduler/:moduleId/leksjoner/:lessonId"
            element={<Lesson />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <span>EduPlan · Læringsplattform</span>
        <span>Plass til å lære. Rom for å vokse.</span>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <TodoProvider>
        <LearningProgressProvider>
          <HashRouter>
            <Platform />
          </HashRouter>
        </LearningProgressProvider>
      </TodoProvider>
    </ThemeProvider>
  );
}
