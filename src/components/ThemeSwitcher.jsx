import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext.js";

function ThemeSwitcher() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="theme-switcher">
      <span>Gjeldende tema: {theme}</span>
      <button className="theme-button" type="button" onClick={toggleTheme}>
        <span className="theme-symbol" aria-hidden="true">
          {theme === "light" ? "☾" : "☀"}
        </span>
        Bytt tema
      </button>
    </div>
  );
}

export default ThemeSwitcher;
