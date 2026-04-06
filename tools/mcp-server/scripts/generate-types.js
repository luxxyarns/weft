// Generate TypeScript types from weft JSON schemas (../../*/*.schema.json)
import { compileFromFile } from "json-schema-to-typescript";
import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEFT_ROOT = resolve(__dirname, "../../..");
const OUT_DIR = resolve(__dirname, "../src/generated");

mkdirSync(OUT_DIR, { recursive: true });

const schemas = [
  ["02-material", "material"],
  ["03-project", "project"],
  ["05-tool", "tool"],
  ["06-pattern", "pattern"],
  ["08-queue", "queue"],
  ["09-favorite", "favorite"],
  ["11-library", "library"],
  ["12-shop", "shop"],
  ["13-designer", "designer"],
];

for (const [dir, name] of schemas) {
  const schemaPath = resolve(WEFT_ROOT, dir, `${name}.schema.json`);
  try {
    const ts = await compileFromFile(schemaPath);
    writeFileSync(resolve(OUT_DIR, `${name}.ts`), ts);
    console.log(`Generated ${name}.ts`);
  } catch (err) {
    console.error(`Failed ${name}: ${err.message}`);
  }
}
