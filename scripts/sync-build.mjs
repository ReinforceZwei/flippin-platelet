import { copyFile } from "node:fs/promises";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const source = resolve(repoRoot, "dist", "flippin_platelet.js");
const destination = resolve(repoRoot, "flippin_platelet.js");

await copyFile(source, destination);
