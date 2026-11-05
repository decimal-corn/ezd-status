import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { ESLint } from "eslint";

void test("typed linting accepts the ESLint config after checking a source file", async () => {
  const eslint = new ESLint({
    cwd: fileURLToPath(new URL("..", import.meta.url)),
  });

  // Editors reuse the parser service: checking source first used to hide the
  // config's allowDefaultProject setting and produce a fatal parsing error.
  for (const file of [
    "src/App.tsx",
    "eslint.config.js",
    "src/main.tsx",
    "eslint.config.js",
  ]) {
    const [result] = await eslint.lintFiles([file]);

    assert.equal(
      result.errorCount,
      0,
      `${file}: ${JSON.stringify(result.messages)}`,
    );
    assert.equal(
      result.warningCount,
      0,
      `${file}: ${JSON.stringify(result.messages)}`,
    );
  }
});
