import { courses } from "../content/courses.js";
import CourseCard from "../components/CourseCard.jsx";

export default function Courses() {
  return (
    <>
      <header className="intro">
        <span className="eyebrow">PLASS TIL Å LÆRE</span>
        <h1>Finn din neste læringsreise</h1>
        <p>Utforsk kursene og se hva du skal lære, ett steg av gangen.</p>
      </header>
      <div className="course-grid page-section">
        {courses.map((course) => <CourseCard key={course.id} course={course} />)}
      </div>
    </>
  );
}
