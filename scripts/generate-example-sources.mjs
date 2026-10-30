import { readFile, writeFile } from "node:fs/promises";
let output = "// Generated from the trusted examples. Never stringified at runtime.\n";
for (const [name, file] of [["practiceApiSource", "practiceApi.js"], ["taskStorageSource", "taskStorage.js"], ["lessonQueryViewSource", "LessonQueryResult.jsx"]]) {
  const source = await readFile(new URL(`../src/content/examples/${file}`, import.meta.url), "utf8");
  output += `export const ${name} = ${JSON.stringify(source)};\n`;
}
await writeFile(new URL("../src/content/examples/exampleSources.js", import.meta.url), output);
