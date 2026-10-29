import { useContext } from "react";
import { TodoProvider } from "./context/TodoProvider.jsx";
import { ThemeProvider } from "./context/ThemeProvider.jsx";
import { ThemeContext } from "./context/ThemeContext.js";
import AddTodo from "./components/AddTodo.jsx";
import TodoList from "./components/TodoList.jsx";
import Progress from "./components/Progress.jsx";
import ThemeSwitcher from "./components/ThemeSwitcher.jsx";
import "./App.css";

function LearningGoals() {
  const { theme } = useContext(ThemeContext);

  return (
    <div className="app" data-theme={theme}>
      <header className="site-header">
        <div className="header-inner">
          <div className="brand">
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
          </div>
          <ThemeSwitcher />
        </div>
      </header>

      <main className="main-content">
        <section className="intro" aria-labelledby="page-title">
          <span className="eyebrow">SMÅ STEG. NY KUNNSKAP.</span>
          <h1 id="page-title">Din oversikt over læringsmål</h1>
          <p>
            Gi læringen retning. Sett deg et mål, ta ett steg av gangen og se
            fremgangen din.
          </p>
        </section>

        <div className="dashboard">
          <section className="goals-panel" aria-labelledby="goals-title">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">DITT NESTE STEG</span>
                <h2 id="goals-title">Mine læringsmål</h2>
              </div>
              <span className="section-icon" aria-hidden="true">
                ↗
              </span>
            </div>
            <AddTodo />
            <TodoList />
          </section>
          <aside className="sidebar" aria-label="Progresjon og motivasjon">
            <Progress />
            <div className="encouragement">
              <span className="sparkle" aria-hidden="true">
                ✧
              </span>
              <h2>Litt hver dag teller.</h2>
              <p>
                Store fremskritt starter med små mål. Hva vil du lære i dag?
              </p>
              <span className="note-line" aria-hidden="true" />
            </div>
          </aside>
        </div>
        <p className="session-note">
          Målene dine lagres i denne økten. Ved oppdatering av siden starter du
          på nytt.
        </p>
      </main>
      <footer className="site-footer">
        <span>EduPlan · Læringsmål</span>
        <span>Plass til å lære. Rom for å vokse.</span>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <TodoProvider>
        <LearningGoals />
      </TodoProvider>
    </ThemeProvider>
  );
}

export default App;
