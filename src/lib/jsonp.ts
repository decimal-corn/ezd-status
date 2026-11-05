import type { CaseStatus } from "../types/index.ts";
import { urlFor, validData } from "./cases.ts";

let sequence = 0;

export function jsonp(
  full: string,
  signal: AbortSignal,
  timeout: number,
): Promise<CaseStatus> {
  return new Promise<CaseStatus>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Stopped", "AbortError"));

      return;
    }

    const name = `ezd_cb_${Date.now()}_${++sequence}`;
    const script = document.createElement("script");
    const callbacks = window as unknown as Record<
      string,
      ((data: unknown) => void) | undefined
    >;
    let settled = false;

    const finish = (error: Error | null, data?: CaseStatus) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timer);
      signal.removeEventListener("abort", abort);
      script.remove();

      callbacks[name] = () => {};

      setTimeout(() => {
        delete callbacks[name];
      }, 60000);

      if (error) {
        reject(error);
      } else if (data) {
        resolve(data);
      }
    };

    const abort = () => finish(new DOMException("Stopped", "AbortError"));

    callbacks[name] = (data: unknown) =>
      validData(data)
        ? finish(null, data)
        : finish(new Error("Unexpected response format"));
    script.onerror = () =>
      finish(
        new Error("Unable to load: the network or service is unavailable"),
      );

    script.onload = () => {
      if (!settled) {
        finish(new Error("The response did not call the JSONP callback"));
      }
    };

    const timer = setTimeout(
      () => finish(new Error(`No response within ${timeout / 1000} seconds`)),
      timeout,
    );

    signal.addEventListener("abort", abort, { once: true });
    script.src = urlFor(full, name);
    document.head.append(script);
  });
}
