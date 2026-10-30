# EduPlan - nettlesertest

Dato: 2026-10-30
Prosjekt: react-oppgave-3, branch `develop`
Adresse: http://localhost:5173/react-oppgave-3/ (Vite dev-server, ikke produksjonsbygg)
Kildekoden er ikke endret. Ingen commit, push eller deploy.

## Hvordan testen ble utført (og hva den ikke dekker)

- Nettleser: den innebygde nettleseren i Claude desktop (Chromium), som har egen, isolert lagring. Profilen var tom ved start.
- Playwright er ikke installert i prosjektet, og en lokal hjelpeserver ble avslått av rettighetssystemet. Jeg brukte derfor testskript som kjørte inne i siden via nettleserverktøyet. Skriptene klikket på ekte lenker og knapper (`element.click()`), satte inn tekst med innebygde input-hendelser, scrollet vinduet i trinn og leste resultatet fra DOM. Det er ekte React-hendelser i en ekte nettleser, men ikke "pålitelige" mus- og tastaturhendelser fra operativsystemet. Det er mulig noe som bare skjer ved ekte pekerinteraksjon ikke er fanget.
- Kildekoden ble brukt til å hente fasit (forventede svar), leksjonsrekkefølge og antall mål. Selve testingen skjedde i nettleseren. Progresjon ble aldri skrevet direkte til localStorage, bortsett fra i de bevisste lagringstestene i kapittel 6 (på den isolerte profilen, med sikkerhetskopi).
- Skjermbilder ble tatt og vurdert underveis, men ikke lagret som filer i prosjektet.
- Pedagogiske vurderinger bygger på oppførselen i brukergrensesnittet og en kildeanalyse av svaralternativene. Jeg har ikke lest all undervisningsteksten i alle 65 leksjoner kritisk, så "vanskelig å forstå"-vurderinger av forklaringstekst er ikke gjort systematisk.

## Sammendrag

| Måling | Resultat |
|---|---|
| Leksjoner besøkt | 65 av 65 (kjørt i full test, i ren kjøring uten Tailwind og i bredde-skanning ved 375 px) |
| Oppgaver testet | 202 av 202 |
| Feil svar sendt inn | 202 (alle vurdert som feil) |
| Riktige svar sendt inn | 202 i hovedkjøringen, pluss 201 i den rene kjøringen = 403 |
| Innsendinger totalt i hovedkjøringen | 404 |
| Navigasjonsflyter testet | 14 flyter, pluss 64 påfølgende "Neste leksjon"-klikk |
| Tekniske feil funnet | 3 (alle lave) |
| Pedagogiske forbedringsforslag | 6 |
| JavaScript-feil i konsollen | 0 |
| React-advarsler | 0 |
| Feilede nettverksforespørsler | 0 (kun 200 og 304) |

Bestått: alle 202 oppgaver oppførte seg riktig ved feil svar, nytt forsøk og riktig svar. Alle sjekkpunkter for progresjon, lagring, navigasjon og feilsider bestod. Avvikene er lavt rangerte: kontrast, temavalg som ikke huskes, og tre eldre leksjoner med avvikende oppbygning.

## Testdekning per modul

Alle oppgaver i tabellen er testet med både feil og riktig svar via nettleseren.

| # | Modul | Leksjoner | Besøkt | Oppgaver | Testet | Feil |
|---|---|---|---|---|---|---|
| 1 | javascript-grunnlag | 4 | 4 | 12 | 12 | 0 |
| 2 | jsx-komponenter | 4 | 4 | 15 | 15 | T3 (3 leksjoner) |
| 3 | props-komposisjon | 4 | 4 | 12 | 12 | 0 |
| 4 | styling-tilgjengelighet | 5 | 5 | 15 | 15 | 0 |
| 5 | state-hendelser | 5 | 5 | 15 | 15 | 0 |
| 6 | skjemaer-samarbeid | 4 | 4 | 12 | 12 | 0 |
| 7 | effekter-api | 6 | 6 | 19 | 19 | 0 |
| 8 | egne-hooks | 4 | 4 | 12 | 12 | 0 |
| 9 | context-state | 5 | 5 | 15 | 15 | 0 |
| 10 | routing | 4 | 4 | 12 | 12 | 0 |
| 11 | serverdata | 5 | 5 | 16 | 16 | 0 |
| 12 | testing | 5 | 5 | 16 | 16 | 0 |
| 13 | robusthet | 6 | 6 | 19 | 19 | 0 |
| 14 | sluttprosjekt | 4 | 4 | 12 | 12 | 0 |
| | **Sum** | **65** | **65** | **202** | **202** | |

Oppgavetyper: 78 flervalg, 66 finn feilen, 58 kodeutfylling. Alle 144 valgoppgaver har nøyaktig 3 alternativer.

## Resultater per testområde

### Oppstart
- Applikasjonen laster, dashboardet vises, React-kurset er tilgjengelig.
- Kursoversikten viser "14 moduler" og "65 leksjoner". Moduloversikten har 14 modullenker og 65 leksjonslenker.
- Dashboardet starter på "0 av 201 obligatoriske kunnskapsmål mestret" og "62 praktiske mål".

### Gjennomgang av leksjoner (65 av 65)
For hver leksjon, i kursets rekkefølge og med klikk på "Neste leksjon":
- Riktig tittel (h1) vises.
- Scrollet gjennom hele siden (bunn nådd).
- Kursmål, undervisningsseksjoner (6 eller 7 per leksjon), kodeblokker, oppgavekort, oppsummering og neste/forrige-lenker finnes og peker til riktig leksjon.
- Antall oppgavekort samsvarer med antall oppgaver i kursdata i alle 65 leksjoner.
- Ingen tomme kodeblokker, ingen avkuttet tekst, ingen horisontal sideoverflyt.
- Praktisk aktivitet ("Programmer selv") finnes i 62 leksjoner. De tre som mangler er omtalt i T3.
- Visuelt eksempel finnes i 31 leksjoner. Det er statiske forhåndsvisninger (nettleserresultat og komponenttre), ikke interaktive. De rendret uten feil i de som ble sett på skjerm (blant annet fragmenter-komponenttraer).
- Siste leksjon viser "Dette er kursets siste leksjon."

### Interaktive oppgaver (202 av 202)
For hver oppgave:
- Før innsending: knappen "Sjekk svar" er deaktivert, og tilbakemeldingsfeltet er tomt. Ingen fasit vises før innsending. Alle svaralternativer og inndatafelt fungerer. Oppgavetittel samsvarer med kursdata.
- Feil svar: vurderes som "Ikke helt riktig ennå." med forklaring. Mål med denne oppgaven blir ikke "Mestret", kun "Under arbeid".
- Nytt forsøk: når svaret endres, nullstilles tilbakemeldingen og knappen aktiveres igjen. Studenten kan prøve så mange ganger som ønsket.
- Riktig svar: godkjennes med "Riktig!" og forklaring. Alle kunnskapsmål i leksjonen ble "Mestret".
- Etter siste innsending bestemmer siste svar status (et feil svar etter et riktig svar gir "Under arbeid" igjen, bekreftet i fetch-http).

### Progresjonssystem
- Ubesvart: "Ikke startet". Feil: "Under arbeid". Riktig: "Mestret". Alle bekreftet i nettleseren.
- Praktiske mål: 62 av 62 viser "Ikke automatisk vurdert" også når alle oppgaver er besvart riktig. Ingen ble markert som mestret.
- Valgfrie Tailwind-mål: i en ren kjøring (tom lagring, alle oppgaver riktig unntatt Tailwind-leksjonen) viste dashboardet "201 av 201 ... 100 %". De valgfrie målene sto igjen som "Ikke startet" og påvirket ikke prosenten.
- Dashboardprosent etter hver av de 14 modulene i den rene kjøringen stemte nøyaktig med forventet verdi beregnet fra kursdata (12, 29, 41, 53, 68, 80, 99, 111, 126, 138, 154, 170, 189, 201 av 201).
- Leksjonsprogresjon: avkrysningen "Jeg har gjennomgått leksjonen" gir "Kunnskapsdel mestret: Ja" når alle svar er riktige. Se P4 om at dashboardet bruker en annen definisjon.
- Etter full sideoppdatering (hard reload) ble status, antall forsøk ("2 innsendte forsøk · Sist besvart riktig"), gjennomgått-status og dashboardprosent (201 av 201) bevart. Kontrollert i alle 14 moduler (siste leksjon i hver) og på fetch-http i detalj.
- Valgt svar (radioknapp eller skrevet tekst) huskes ikke etter oppdatering, kun resultatet. Se P6.

### Navigasjon
Alle bestått:
1. Dashboard til Kursoversikt (hovednavigasjon).
2. Kursoversikt til kursside.
3. Kursside til moduloversikt ("Se moduloversikten").
4. Moduloversikt til modul.
5. Modul til leksjon.
6. Leksjon til neste leksjon (64 klikk i kjede, og stikkprøve).
7. Leksjon til forrige leksjon.
8. Leksjon til moduloversikt via brødsmule.
9. Brødsmuler til kurs og kursside (hrefs `#/kurs` og `#/kurs/react`).
10. Nettleserens tilbake.
11. Nettleserens fremover.
12. Direkte åpning av leksjonsadresse.
13. Sideoppdatering på leksjonsadresse (innholdet lastes på nytt).
14. Ugyldige adresser (se under).

HashRouter fungerer med base path `/react-oppgave-3/`: alle adresser har formen `/react-oppgave-3/#/kurs/...`. Å åpne rotadressen uten hash viser dashboardet.

### Lys og mørk modus
- Bytte med knappen "Bytt tema" fungerer. Dashboard, kursoversikt, kursside, moduloversikt, modulside, leksjon, kodeblokker, oppgavekort, svaralternativer, riktig/feil-tilbakemelding, progresjonsmerker og 404-siden ble kontrollert visuelt og med en kontrastskanner (WCAG AA, tekst mot effektiv bakgrunn).
- Mørk modus: ingen reelle kontrastbrudd. Eneste treff er deaktiverte knapper ("Sjekk svar", "Legg til"), som er unntatt fra kravet.
- Lys modus: se T1.
- Temavalget huskes ikke etter oppdatering, se T2.

### Mobil og bredder
Skanning for horisontal sideoverflyt (elementer utenfor visningsområdet utenfor rullbare beholdere), kodeblokker bredere enn skjermen og avkuttet tekst:
- 375 px: dashboard, kurs, kursside, moduloversikt, modulside, 404 og alle 65 leksjoner. Ingen funn. Kodeblokkene ruller horisontalt inni seg selv (de fleste leksjoner har minst en slik), og siden får ikke sideveis scrolling.
- 768 px: 5 sider og 17 leksjoner (en per modul, de tre eldre leksjonene og Tailwind). Ingen funn.
- 1440 px: samme utvalg. Ingen funn.
- Lange titler brytes pent ved 375 px (lengste overskrift var 28 tegn, så lange titler er ikke grundig stresstestet).
- Ikke testet systematisk: tastaturnavigasjon og berøringsstørrelser på knapper.

### Feilhåndtering
Utført i den isolerte profilen. Originalprogresjonen ble sikkerhetskopiert i sessionStorage og gjenopprettet.
- Ugyldige leksjons-, modul- og kursadresser, tom leksjons-id, helt ukjent sti, og gyldig leksjon i feil modul: alle gir siden "Vi fant ikke det du lette etter" med lenke til kursoversikten.
- Manglende lagringsdata: tom start, 0 %, ingen feilmelding. Første svar blir lagret.
- Ugyldig JSON (`{ugyldig json`) og feil skjema (`{"version":2,...}`): tydelig melding ("Lagret progresjon kunne ikke leses. Originaldata er ikke overskrevet ...") på dashboard og leksjon. Studenten kan fortsette å øve i økten. Etter et riktig svar var originaldataene i localStorage uendret. Mislykket "Les lagret progresjon på nytt" beholder øktens arbeid. Etter at gyldige data ble gjenopprettet, lastet samme knapp inn 201 av 201.
- "Erstatt lagring ..." er deaktivert til avkrysning er gjort, og først da skrives øktens progresjon. Ingen automatisk overskriving.
- `setItem` som kaster `QuotaExceededError` (simulert i økten): melding "Progresjonen kunne ikke lagres. Endringene beholdes i minnet ...", fremdrift beholdes i økten.
- `getItem` som kaster (simulert under "Les på nytt"): økten og meldingen beholdes.
- Ikke testet: at `localStorage` selv er blokkert ved sidestart (kan ikke simuleres uten å endre koden eller bruke annen nettleserprofil). Samme kodevei (catch) som ugyldig JSON, men ikke bekreftet i nettleser.

### Konsoll og nettverk
- Feilfangst i siden (console.error, console.warn, uncaught, unhandledrejection) registrerte 0 hendelser under hele hovedkjøringen og den rene kjøringen.
- Nettleserens konsoll viste kun Vite-meldingene `[vite] connecting/connected` og React DevTools-infomeldingen. Disse skyldes utviklingsmiljøet, ikke EduPlan.
- Nettverk: bare 200 og 304 på Vite-moduler (kun siste 500 forespørsler ble buffret). Ingen 404 eller mislykkede forespørsler.
- Dette er kjørt mot dev-serveren. Produksjonsbygg (`dist`, gh-pages) er ikke testet.

## Feilrapport (tekniske feil)

Ingen kritiske, høye eller middels feil funnet.

### T1 - Lav: muted tekst i lys modus har kontrast under WCAG AA
- Modul og leksjon: gjelder alle sider, målt blant annet i effekter-api / fetch-http.
- Forsøkt: kontrastskanning av all synlig tekst i lys modus.
- Forventet: minst 4,5:1 for normal tekst.
- Faktisk: tekst i `rgb(108, 121, 115)` mot `rgb(246,247,244)` gir 4,23:1 (brødsmuler, "Ikke automatisk vurdert", bunnlinje) og mot `rgb(252,253,251)` gir 4,45:1 (oppgavetellere som "1 av 1 tilknyttede oppgaver bestått"). Hintteksten "Endre svaret for å prøve igjen." i tilbakemeldingsboksen får 3,87:1 etter feil svar og 4,01:1 etter riktig svar.
- Gjenskape: åpne en leksjon i lys modus, svar på en oppgave, mål kontrast for `.muted`.
- Konsollfeil: ingen. Skjermbilde: tilbakemeldingsboksen ble sett i begge temaer, uten lagret fil.
- Forslag: mørkere muted-farge i lys modus (omtrent `#5d6963` eller mørkere).

### T2 - Lav: valgt tema huskes ikke etter sideoppdatering
- Modul og leksjon: global.
- Forsøkt: byttet til mørkt tema og lastet siden på nytt.
- Forventet: temavalget beholdes (eller følger operativsystemets `prefers-color-scheme`).
- Faktisk: siden starter alltid i lys modus ("Gjeldende tema: light"), selv om nettleseren oppgir `prefers-color-scheme: dark`. Ingen tema-nøkkel i localStorage.
- Gjenskape: klikk "Bytt tema", last siden på nytt.
- Konsollfeil: ingen.

### T3 - Lav: tre eldre leksjoner avviker fra malen til resten
- Modul og leksjon: jsx-komponenter / funksjonskomponenter, fra-main-til-app, jsx-regler.
- Forsøkt: sammenlignet struktur med de øvrige 62 leksjonene.
- Forventet: samme seksjoner og navn som i resten av kurset (oppsummering "Oppsummering og videre læring", "Kunnskapsdel mestret" og en praktisk aktivitet).
- Faktisk: overskriften er "Oppsummering", progresjonsboksen sier "Leksjon mestret", og det finnes ingen praktisk aktivitet ("Programmer selv") og ingen praktisk mål. Direkte inspisert i jsx-regler. De to andre ga identiske avvik i testen, men er ikke åpnet separat for å lese hele siden.
- Gjenskape: åpne #/kurs/react/moduler/jsx-komponenter/leksjoner/jsx-regler og scroll til bunnen.
- Konsollfeil: ingen.
- Merk: innholdet er komplett og oppgavene fungerer. Dette er inkonsistens, ikke manglende funksjon. De 62 praktiske målene i dashboardet gjelder bare de 62 øvrige leksjonene.

## Pedagogiske observasjoner (forbedringsforslag, ikke tekniske feil)

### P1 - Fasit vises umiddelbart etter første feil (høy pedagogisk effekt)
Etter ethvert feil svar viser tilbakemeldingen "Riktig svar: ..." (observert i alle 202 oppgaver). Kombinert med ubegrenset antall forsøk og 3 alternativer i alle 144 valgoppgaver kan en student bestå hvilken som helst oppgave på to forsøk uten å ha forstått noe. Fasiten vises ikke før innsending, så kravet "ingen fasit før innsending" er oppfylt, men fasiten avslører oppgaven rett etter første feil.
Forslag: vis forklaring uten fasit etter første feil, og fasit først etter flere forsøk eller ved eget klikk.

### P2 - Oppgaver er enkle å gjette
Alle valgoppgaver har 3 alternativer (33 % treff ved ren gjetting). Riktig alternativ ligger oftere først (56 av 144 er første, 40 andre, 48 tredje). Det riktige alternativet er det lengste i 36 av 144 (25 %, ikke et sterkt mønster). 34 av 58 kodeutfyllinger har svar på 6 tegn eller færre, og 56 av 58 har bare ett godkjent svar.
Forslag: 4 alternativer, bland rekkefølge, flere godkjente svar eller mer tilgivende sammenligning i kodeutfylling.

### P3 - Kunnskapskontroll gir ingen mestring uten å forstå (følger av P1)
Dashboardet viser 100 % etter at alle oppgaver er besvart, uavhengig av antall forsøk (en student som alltid svarer feil først og så kopierer fasiten får 100 %). Vurder å vise antall forsøk per mål eller kreve riktig svar på første eller andre forsøk for "Mestret".

### P4 - To forskjellige definisjoner av "mestret"
Kursmål på dashboard og i leksjon blir "Mestret" når oppgavene er riktige. Leksjonsboksen sier "Kunnskapsdel mestret: Ikke ennå" til studenten i tillegg krysser av "Jeg har gjennomgått leksjonen". Begge samtidig kan forvirre ("Mestret" og "Ikke ennå" på samme side).

### P5 - Praktiske mål gir ingen fremdriftsoppfølging
62 praktiske mål står for alltid som "Ikke automatisk vurdert". Det er riktig oppførsel (de skal ikke auto-godkjennes), men studenten har ingen måte å markere dem som gjort selv. Vurder en egen avkrysning, tydelig skilt fra automatisk mestring.

### P6 - Svar huskes ikke etter oppdatering
Resultatet ("2 innsendte forsøk · Sist besvart riktig") lagres, men studentens eget svar vises ikke igjen. Oppgaven ser ubesvart ut i skjemaet selv om status er "riktig".

Ikke vurdert: om enkeltoppgavers instruksjoner er uklare, om enkeltforklaringer er vanskelige, og om sammenhengen mellom forklaring og oppgave er god i hver leksjon. Det krever en faglig lesing av innholdet som ikke ble gjort her.

## Rydding og tilstand etter testen
- Nettleserprofilen i appens innebygde nettleser inneholder testprogresjon (alle mål mestret etter siste kjøring). Den er isolert fra Chrome og kan nullstilles ved å tømme `eduplan.learning-progress.v1`.
- Ingen filer i `src/`, `tests/` eller andre kildefiler er endret. Eneste nye fil er denne rapporten. Hjelpefiler for kartlegging ligger i økt-mappen (scratchpad), ikke i prosjektet.

## Vurdering

Er EduPlan klar for en fullstendig studentgjennomgang? **Ja, teknisk sett.** I nettleseren fungerte alle 65 leksjoner, alle 202 oppgaver, lagring og progresjon, navigasjon, feilsider, mørk og lys modus og tre bredder, uten konsollfeil. De tre tekniske funnene er lave og hindrer ikke gjennomgang.

Forbehold: det største problemet er pedagogisk, ikke teknisk. Fasit vises etter første feil, og valgoppgavene har bare 3 alternativer, så kunnskapskontrollen måler lite. Fiks P1 før studentene får vurdere kursets læringseffekt. Testen er kjørt mot dev-serveren med DOM-hendelser, ikke mot produksjonsbygget og ikke med pekerhendelser fra operativsystemet.
