import { code, paragraph, section, sequence } from "./extendLesson.js";
export const workshops = {
  "context-hooks": { sections: [section("to-context-er", "Bygg og følg to avgrensede abonnementer",
    paragraph("Begynn med én verdi som faktisk deles: tema. ValueContext distribuerer temaet, mens SetterContext distribuerer den stabile setteren fra useState. De to hookene sjekker providergrensen hver for seg. Oppdeling er nyttig når noen consumers bare trenger handlingen; det er ingen garanti mot vanlig rendering fra en forelder."),
    code("ThemeContext.jsx – komplett provider og lesekontrakt", `import { createContext, useContext, useState } from "react";
const ValueContext = createContext(null);
const SetterContext = createContext(null);
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  return <ValueContext.Provider value={theme}>
    <SetterContext.Provider value={setTheme}>{children}</SetterContext.Provider>
  </ValueContext.Provider>;
}
export function useThemeValue() {
  const value = useContext(ValueContext);
  if (value === null) throw new Error("ThemeProvider mangler");
  return value;
}
export function useThemeSetter() {
  const value = useContext(SetterContext);
  if (value === null) throw new Error("ThemeProvider mangler");
  return value;
}`),
    code("App.jsx – ulike consumers", `import { ThemeProvider, useThemeValue, useThemeSetter } from "./ThemeContext.jsx";
function ThemeLabel() {
  const theme = useThemeValue();
  return <p>Tema: {theme}</p>;
}
function ThemeSwitch() {
  const setTheme = useThemeSetter();
  return <button onClick={() => setTheme((t) => t === "light" ? "dark" : "light")}>
    Bytt tema
  </button>;
}
export default function App() {
  return <ThemeProvider><ThemeLabel /><ThemeSwitch /></ThemeProvider>;
}`),
    sequence("Context-varsling ved Bytt tema", [["Før", "ValueContext = light. SetterContext = samme setTheme-funksjon."], ["Hendelse", "Setteren køer dark. Provideren rendrer med ny temaverdi."], ["Etter", "ThemeLabel får ny verdi gjennom sitt abonnement. Setter-abonnementet varsles ikke om en ny funksjon; andre renderingsårsaker kan fortsatt finnes."]]),
    paragraph("Kontroller temaetiketten i nettleseren. Bruk DevTools til å se hvilke Context-er hvert barn leser. Ikke bruk et bestemt antall console.log-kall som bevis: StrictMode og foreldrerendering kan gi flere kall uten at abonnementet er feil."),
  )], practice: { startpoint: "Kopier de to komplette filene over til et eget prosjekt. Verifiser Bytt tema før du endrer strukturen.", checks: ["To klikk gir light → dark → light i etiketten.", "Flytt ThemeLabel utenfor provideren midlertidig: den dokumenterte feilen skal vises.", "Finn i kildekoden at ThemeSwitch bare leser SetterContext. Forklar hvorfor dette ikke beviser at komponenten aldri kan rendre igjen."], extensions: ["Mål et faktisk problem før du legger til memo rundt tunge consumers."] } },
};
