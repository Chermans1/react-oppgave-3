import { Link } from "react-router-dom";
import { courses } from "../content/courses.js";
import CourseCard from "../components/CourseCard.jsx";
import AddTodo from "../components/AddTodo.jsx";
import TodoList from "../components/TodoList.jsx";
import CourseGoals from "../components/CourseGoals.jsx";
import Progress from "../components/Progress.jsx";

export default function Dashboard() {
  return (
    <>
      <section className="dashboard-course">
        <div className="section-heading">
          <div><span className="eyebrow">DIN LÆRINGSREISE</span><h2>Ta neste steg med React</h2></div>
          <Link className="text-link" to="/kurs">Se alle kurs →</Link>
        </div>
        <div className="course-grid">{courses.map((course) => <CourseCard key={course.id} course={course} />)}</div>
      </section>
      {courses.map((course) => <CourseGoals key={course.id} course={course} />)}
        <section className="intro personal-goals-intro" aria-labelledby="goals-intro-title">
          <span className="eyebrow">SMÅ STEG. NY KUNNSKAP.</span>
          <h1 id="goals-intro-title">Dine personlige læringsmål</h1>
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
                <h2 id="goals-title">Personlige læringsmål</h2>
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
          De personlige målene dine lagres i denne økten. Ved oppdatering av siden starter du
          på nytt.
        </p>
    </>
  );
}
