import { Link } from "react-router-dom";

export default function Breadcrumbs({ items }) {
  return (
    <nav className="breadcrumbs" aria-label="Brødsmuler">
      <ol>
        <li><Link to="/kurs">Kurs</Link></li>
        {items.map((item, index) => (
          <li key={index}>
            {item.to
              ? <Link to={item.to}>{item.label}</Link>
              : <span aria-current="page">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
