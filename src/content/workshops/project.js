import { code, list, paragraph, section } from "./extendLesson.js";
const tracks = ["API/Query-spor: bytt bare kataloglesing til det kontrollerte API-et fra fetch-http. Bruk én QueryClient, kursavhengige nøkler og signal. Test success, empty, error og slow. Oppretting skal invalidere riktig liste og bevare utkast ved feil.", "TypeScript-spor: flytt kurs-, oppgave- og progresjonstyper til egne moduler. Type komponentprops, callbacks og lagringslesing fra unknown. npx tsc -p tsconfig.app.json --noEmit skal passere; vis at feil oppgavetype eller felttype oppdages."];
export const workshops = {
  datamodell: { sections: [section("byggetrinn-en", "Byggetrinn 1: ett testbart tverrsnitt",
    paragraph("Minimum er en lokal læringsplattform uten backend. Bruk to kurs. React-kurset skal ha to moduler med to leksjoner hver; det andre kurset kan ha én modul med én leksjon. Data-ID-er skal være stabile og unike innen avtalt scope. Slå opp etter id i stedet for arrayposisjon."),
    list("Dashboard → kursoversikt → React → modul → leksjon. Hvert steg bruker en ekte Link til et eksisterende dataobjekt.",
      "Forrige/neste følger datarekkefølgen, også over en modulgrense. Første leksjon har ingen Forrige; siste har ingen Neste.",
      "Åpne en dyp hash-lenke direkte og oppdater siden: samme leksjon og brødsmulesti vises.",
      "Test ukjent courseId, moduleId og lessonId hver for seg: forståelig ikke-funnet-visning og lenke tilbake. Vis aldri feil leksjon som reserve."),
    code("Skriv navigasjonsscenariene før du implementerer dem", `Scenario                  Forventet resultat
#/courses/react           Kursdetaljer for React
#/courses/react/m/jsx/l/a  Leksjon a med modulens brødsmuler
Bytt fra a til b          URL, tittel og mål bytter sammen
Siste i modul → Neste     Første leksjon i neste modul
Ukjent leksjons-id        Ikke funnet; ingen fremmed leksjon
Reload på dyp lenke       Samme leksjon åpnes`, "text"),
  )], practice: { description: "Bygg en lokal plattform med to kurs. React-kurset skal ha to moduler med to leksjoner hver; det andre kurset kan ha én modul med én leksjon. Implementer navigasjon før oppgavemotoren.", startpoint: "Opprett en separat Vite/React-app med HashRouter og statiske kursdata. Bruk scenarioadressene som mønster; velg én konsekvent faktisk rutekontrakt og bruk den i tester og lenker.", criteria: ["To kurs: React har to moduler med to leksjoner hver; det andre har én modul med én leksjon. Minst én modulovergang kan navigeres uten sideinnlasting.", "Dyp lenke og reload gir samme leksjon; alle tre ukjente id-typer håndteres.", "Alle data-ID-er valideres og eksisterende lenker brytes ikke når arrayrekkefølgen endres."], checks: ["Tell dataene: React har to moduler med to leksjoner hver, det andre kurset har én modul med én leksjon.", "Gå hele reisen med tastatur og bruk Tilbake/Frem i nettleseren.", "Kjør en test for hver rad i navigasjonstabellen mot dine faktiske ruter.", "Bytt rekkefølge i data uten å endre id-er: lenker og oppslag skal fortsatt være riktige."], extensions: tracks } },
  "state-lagring": { sections: [section("byggetrinn-to", "Byggetrinn 2: eier, format og feilgrenser",
    paragraph("Personlige mål og kursprogresjon har ulike eiere. Hold kursdata og fasit utenfor lagret progresjon. Bruk en versjonert nøkkel i ditt eget prosjekt; ikke endre EduPlans nøkler. En status som kan beregnes fra forsøk skal ikke lagres som en ny sannhetskilde."),
    list("Mangler nøkkelen: start tomt og tillat skriving. Gyldig v1: behold gjennomgått-status og svar per stabil id.",
      "Ugyldig JSON eller feil struktur: vis feilmelding, bevar råverdien, sperr automatisk skriving og la brukeren arbeide i minnet.",
      "setItem kaster: behold minnet og vis at siste endring ikke ble lagret. Ikke slett andre nøkler.",
      "Eksplisitt nullstilling: forklar konsekvensen og test at bare egen nøkkel erstattes. Oppdatert oppgaverevisjon skal kreve nytt svar, men bevare forsøkshistorikken."),
  )], practice: { startpoint: "Fortsett prosjektet fra trinn 1. Gjenbruk readTasks/writeTasks-prinsippene fra lagringsleksjonen, men valider din egen progresjonsmodell med version, lessons og answers.", criteria: ["Data lagres bare under prosjektets egne dokumenterte nøkler og uten fasit eller innsendt kode.", "Gyldig progresjon består etter reload, også når leksjonsrekkefølgen endres.", "Manglende data, lesefeil og skrivefeil gir de ulike forløpene beskrevet over."], checks: ["Test en adapter med getItem=null, ugyldig JSON og en kastende getItem.", "Test en adapter der setItem kaster; endringen skal fortsatt være synlig i minnet.", "Test gamle svar mot ny oppgaverevisjon: historikk beholdes, ny mestring gis først etter nytt svar."], extensions: tracks } },
  "oppgaver-progresjon": { sections: [section("byggetrinn-tre", "Byggetrinn 3: vurdering som kan etterprøves",
    paragraph("Lag én oppgave av hver støttet type. Minst ett kunnskapsmål skal bruke to forskjellige oppgaver, og ett praktisk mål skal stå uten automatisk vurdering. Vurderingen kjører aldri studentkode. Tabellene under er minimumstilfeller for rene progresjonstester og UI-tester."),
    code("Vurderingsmatrise – mål med oppgavene A og B", `A                B                Kunnskapsstatus
Ikke forsøkt     Ikke forsøkt      Ikke startet
Feil             Ikke forsøkt      Under arbeid
Riktig           Ikke forsøkt      Under arbeid
Riktig           Feil              Under arbeid
Riktig           Riktig            Mestret
Gammel revisjon  Riktig            Under arbeid
Ingen tilknyttede oppgaver         Aldri automatisk mestret
Praktisk mål uten vurdering        Ikke automatisk vurdert`, "text"),
    code("Oppgavemotorens kontrakt", `Hendelse                        Forventning
Åpne en oppgave                 Ingen fasit; ingen registrert besvarelse
Send feil                       Feil + forklaring; forsøk øker
Prøv igjen og send riktig       Riktig + forklaring; siste resultat oppdateres
Naviger til ubesvart oppgave     Fasit er skjult for denne oppgaven
Kodefelt med { 12 }              Samme gyldige talluttrykk som {12}
Kodefelt med {1 2} eller "12"    Avvist for oppgaven som krever tallet 12
Reload                          Samme lagrede resultat; fasit åpnes ikke automatisk`, "text"),
  )], practice: { startpoint: "Legg en datadefinert oppgave av hver type i prosjektet fra trinn 2. Lag rene funksjoner for svarvurdering og målstatus før du kobler på skjemaene.", criteria: ["Alle radene i de to matrisene har automatiserte tester.", "To uavhengige oppgaver kreves for ett mål; ingen praktisk ferdighet godkjennes av teorisvar.", "Dashboard og leksjon beregner samme status; valgfrie mål inngår ikke i obligatorisk prosent."], checks: ["Test feil → riktig → feil igjen og kontroller at siste resultat brukes.", "Åpne en ubesvart oppgave via navigasjon etter at en annen er løst; ingen forklaring skal vises.", "Reload og sammenlign dashboard og leksjon med samme stabile id-er."], extensions: tracks } },
  "testing-publisering": { sections: [section("byggetrinn-fire", "Byggetrinn 4: dokumenter en kontrollerbar leveranse",
    paragraph("Publisering er ikke et minimumskrav i denne øvingen. En reviewer skal kunne starte prosjektet, kjøre tester og følge dokumenterte scenarier lokalt. Grønn build erstatter ingen av kontrollene under."),
    list("Rene tester: svarnormalisering, alle rader i målmatrisen, id-validering og lagringsadapterens feiltilfeller.",
      "UI-/integrasjonstester: ugyldig og gyldig personlig mål, valgt oppgave, nytt forsøk, skjult fasit og dashboard/leksjon-samsvar.",
      "Navigasjonstester: dyp lenke, ukjent id og overgang mellom moduler. Reload-test skal starte appen med tidligere lagringsdata.",
      "Manuell kontroll: bredde 375 px og desktop, begge temaer, tastaturfokus, lesbare kodeblokker og alle Prøv igjen-handlinger.",
      "README: oppstart, testkommandoer, testdata, egne lagringsnøkler, hva som beregnes og hva som ikke vurderes automatisk."),
    paragraph("Som egenkontroll: En ødelagt id-kobling skal gjøre navigasjonstesten rød. En fjernet tomfelt-retur skal gjøre opprettingstesten rød. En endret every til some skal gjøre målmatrisen rød. Gjenopprett fungerende kode før levering."),
  )], practice: { startpoint: "Bruk prosjektet fra de tre foregående trinnene. Skriv en sjekkliste som kobler hvert minimumskrav til en test eller dokumentert manuell observasjon.", criteria: ["Build, lint og alle avtalte tester består fra en dokumentert lokal oppstart.", "Minimumskravene i alle fire byggetrinn har etterprøvbar dokumentasjon.", "README skiller automatisk kunnskapskontroll fra praktisk vurdering og beskriver kjente lagringsbegrensninger."], checks: ["La en annen person følge README uten muntlig veiledning.", "Vis at de tre bevisste feilene over faktisk gir røde tester.", "Kontroller produksjonsbygget lokalt med prosjektets preview-kommando og en direkte hash-lenke."], extensions: tracks } },
};
