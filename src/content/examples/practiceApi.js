// In-memory exercise API: no backend, installation or real network writes.
export function createPracticeApi() {
  let courses = [{ id: "react", title: "React" }, { id: "css", title: "CSS" }, { id: "js", title: "JavaScript" }];
  const lessons = { react: [{ id: "jsx", title: "JSX" }], css: [{ id: "grid", title: "Grid" }], js: [] };
  let scenario = "success";
  let nextId = 1;
  function setScenario(value) {
    if (!["success", "empty", "error", "slow"].includes(value)) throw new Error("Ukjent scenario");
    scenario = value;
  }
  async function request(input, { method = "GET", body, signal } = {}) {
    const currentScenario = scenario;
    const url = new URL(input, "https://practice.invalid");
    // Delay makes loading and cancellation observable. Cleanup releases the listener.
    await new Promise((resolve, reject) => {
      let timer;
      function abort() {
        clearTimeout(timer);
        signal?.removeEventListener("abort", abort);
        reject(new DOMException("Avbrutt", "AbortError"));
      }
      if (signal?.aborted) { abort(); return; }
      signal?.addEventListener("abort", abort, { once: true });
      timer = setTimeout(() => {
        signal?.removeEventListener("abort", abort);
        resolve();
      }, currentScenario === "slow" ? 800 : 10);
    });
    const json = (data, status = 200) => new Response(JSON.stringify(data), {
      status, headers: { "Content-Type": "application/json" },
    });
    if (currentScenario === "error") return json({ message: "Kontrollert serverfeil" }, 503);
    if (url.pathname === "/api/courses" && method === "GET") {
      const all = currentScenario === "empty" ? [] : courses;
      if (!url.searchParams.has("page")) return json(all);
      const page = Number(url.searchParams.get("page"));
      if (!Number.isInteger(page) || page < 1) return json({ message: "Ugyldig side" }, 400);
      const items = all.slice((page - 1) * 2, page * 2);
      return json({ items, hasMore: page * 2 < all.length });
    }
    if (url.pathname === "/api/courses" && method === "POST") {
      let draft;
      try { draft = JSON.parse(body); } catch { return json({ message: "Ugyldig JSON" }, 400); }
      if (typeof draft?.title !== "string" || !draft.title.trim()) return json({ message: "Skriv en tittel" }, 400);
      const course = { id: `new-${nextId++}`, title: draft.title.trim() };
      courses = [...courses, course];
      return json(course, 201);
    }
    const match = /^\/api\/courses\/([^/]+)\/lessons$/.exec(url.pathname);
    if (match && method === "GET") {
      const id = decodeURIComponent(match[1]);
      if (!Object.hasOwn(lessons, id)) return json({ message: "Ukjent kurs" }, 404);
      return json(currentScenario === "empty" ? [] : lessons[id]);
    }
    return json({ message: "Ukjent endepunkt" }, 404);
  }
  return { request, setScenario };
}

export async function readJson(response) {
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
export function validCourses(data) {
  return Array.isArray(data) && data.every((x) =>
    x && typeof x.id === "string" && typeof x.title === "string");
}
export async function getLessons(courseId, { signal, request = fetch } = {}) {
  if (typeof courseId !== "string" || !courseId.trim()) throw new Error("Velg kurs først");
  const data = await readJson(await request(`/api/courses/${encodeURIComponent(courseId)}/lessons`, { signal }));
  if (!validCourses(data)) throw new Error("Uventet leksjonsformat");
  return data;
}
export async function getCourses({ signal, request = fetch } = {}) {
  const data = await readJson(await request("/api/courses", { signal }));
  if (!validCourses(data)) throw new Error("Uventet kursformat");
  return data;
}
export async function createCourse(draft, { request = fetch } = {}) {
  const data = await readJson(await request("/api/courses", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft),
  }));
  if (!validCourses([data])) throw new Error("Uventet kursformat");
  return data;
}
export async function getCoursePage(page, { signal, request = fetch } = {}) {
  if (!Number.isInteger(page) || page < 1) throw new Error("Ugyldig side");
  const data = await readJson(await request(`/api/courses?page=${page}`, { signal }));
  if (!validCourses(data.items) || typeof data.hasMore !== "boolean") throw new Error("Uventet sideformat");
  return data;
}
