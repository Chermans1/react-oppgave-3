// Bundle only authored teaching examples, never student input. Nothing is written to disk.
import { build } from "vite";
import react from "@vitejs/plugin-react";
export async function mountTeachingFixture(page, sources, entry, props = "{}") {
  const files = { ...sources, "fixture.jsx": `import React from "react";
import { createRoot } from "react-dom/client";
import Example from "./${entry}";
window.created = [];
createRoot(document.getElementById("fixture")).render(<Example {...${props}} />);` };
  const prefix = "/__eduplan_teaching_fixture__/";
  const result = await build({ configFile: false, logLevel: "silent", define: { "process.env.NODE_ENV": '"production"' }, plugins: [react(), {
    name: "authored-teaching-example",
    resolveId(source) {
      const name = source.split("/").at(-1);
      if (Object.hasOwn(files, name)) return prefix + name;
    },
    load(id) { if (id.startsWith(prefix)) return files[id.slice(prefix.length)]; },
  }], build: { write: false, minify: false, lib: { entry: "fixture.jsx", formats: ["iife"], name: "TeachingFixture" } } });
  const chunks = (Array.isArray(result) ? result : [result]).flatMap((bundle) => bundle.output).filter((chunk) => chunk.type === "chunk");
  if (chunks.length !== 1) throw new Error("Teaching fixture must be a single isolated bundle");
  const fixtureUrl = new URL("/__eduplan_teaching_fixture__.html", page.url()).href;
  await page.route(fixtureUrl, (route) => route.fulfill({ contentType: "text/html", body: '<div id="fixture"></div>' }), { times: 1 });
  await page.goto(fixtureUrl);
  await page.addScriptTag({ content: chunks[0].code });
}
