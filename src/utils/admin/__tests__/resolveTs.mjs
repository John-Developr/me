// Test-only module resolution for `npm test` (Node's built-in runner).
// Lets tests load app TypeScript the way Next does:
//   "./fieldSchemas"  → "./fieldSchemas.ts"
//   "@/utils/x"       → "<repo>/src/utils/x.ts"
// Node strips the types itself (Node ≥ 22.18); nothing is compiled or installed.
import { register } from "node:module";
import { pathToFileURL } from "node:url";

const srcRoot = pathToFileURL(`${process.cwd()}/src/`).href;

const hooks = `
const SRC = ${JSON.stringify(srcRoot)};
const HAS_EXT = /\\.[cm]?[jt]sx?$/;

export async function resolve(specifier, context, next) {
  let target = specifier;
  if (target.startsWith("@/")) target = new URL(target.slice(2), SRC).href;

  const local = target.startsWith("./") || target.startsWith("../") || target.startsWith("file:");
  if (local && !HAS_EXT.test(target)) {
    for (const ext of [".ts", ".tsx"]) {
      try { return await next(target + ext, context); } catch {}
    }
  }
  return next(target, context);
}
`;

register(`data:text/javascript,${encodeURIComponent(hooks)}`, import.meta.url);
