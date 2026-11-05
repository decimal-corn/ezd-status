import type { ActiveCheck } from "../types/index.ts";
import { caseAt, numbersFor } from "./cases.ts";
import { errorMessage, isAbortError } from "./errors.ts";
import { jsonp } from "./jsonp.ts";

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise<void>((resolve) => {
    if (signal.aborted) {
      resolve();

      return;
    }

    const done = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", done);
      resolve();
    };

    const timer = setTimeout(done, ms);

    signal.addEventListener("abort", done, { once: true });
  });
}

export async function checkCases(
  run: Pick<
    ActiveCheck,
    "case" | "bounds" | "controller" | "results" | "errors"
  >,
  parallel: number,
  timeout: number,
  onUpdate: (results: {
    results: ActiveCheck["results"];
    errors: ActiveCheck["errors"];
  }) => void,
  request: typeof jsonp = jsonp,
): Promise<void> {
  const numbers = numbersFor(run.case, run.bounds);
  let cursor = 0;

  const worker = async () => {
    while (!run.controller.signal.aborted && cursor < numbers.length) {
      const number = numbers[cursor++];
      const full = caseAt(number);

      try {
        const data = await request(full, run.controller.signal, timeout);

        if (run.controller.signal.aborted) {
          break;
        }

        run.results.push({ number, full, data, at: new Date().toISOString() });
      } catch (error) {
        if (isAbortError(error)) {
          break;
        }

        run.errors.push({ number, full, message: errorMessage(error) });
      }

      onUpdate({ ...run, results: [...run.results], errors: [...run.errors] });
      await delay(200, run.controller.signal);
    }
  };

  await Promise.all(Array.from({ length: parallel }, worker));
}
