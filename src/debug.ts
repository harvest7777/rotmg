const UPDATE_INTERVAL_MS = 250;

export type Debug = {
  element: HTMLDivElement;
  frames: number;
  elapsedMs: number;
  intervalSumMs: number;
  intervalMaxMs: number;
  workSumMs: number;
  workMaxMs: number;
};

type DebugText = {
  intervalAvgMs?: number;
  intervalMaxMs?: number;
  workAvgMs?: number;
  workMaxMs?: number;
};

function formatMs(value: number | undefined) {
  return value === undefined ? "---" : value.toFixed(1);
}

function setDebugText(element: HTMLDivElement, text: DebugText) {
  element.textContent =
    `interval ${formatMs(text.intervalAvgMs)} avg ${formatMs(text.intervalMaxMs)} max\n` +
    `work     ${formatMs(text.workAvgMs)} avg ${formatMs(text.workMaxMs)} max`;
}

export function createDebug(): Debug {
  const element = document.createElement("div");
  element.style.cssText = `
    position: fixed;
    top: 8px;
    left: 8px;
    padding: 6px 8px;
    color: #0f0;
    font: 12px monospace;
    white-space: pre;
    pointer-events: none;
  `;

  setDebugText(element, {});
  document.body.appendChild(element);

  return {
    element,
    frames: 0,
    elapsedMs: 0,
    intervalSumMs: 0,
    intervalMaxMs: 0,
    workSumMs: 0,
    workMaxMs: 0,
  };
}

export function updateDebug(debug: Debug, intervalMs: number, workMs: number) {
  debug.frames += 1;
  debug.elapsedMs += intervalMs;
  debug.intervalSumMs += intervalMs;
  debug.intervalMaxMs = Math.max(debug.intervalMaxMs, intervalMs);
  debug.workSumMs += workMs;
  debug.workMaxMs = Math.max(debug.workMaxMs, workMs);

  // Only calculate for every UPDATE_INTERVAL_MS window of seconds
  // This is necessary so we don't keep a forever running average, at that point
  // after thousands of frames one frame drop would not change the metric, 
  // even though we need it to for observability
  if (debug.elapsedMs < UPDATE_INTERVAL_MS) {
    return;
  }

  setDebugText(debug.element, {
    intervalAvgMs: debug.intervalSumMs / debug.frames,
    intervalMaxMs: debug.intervalMaxMs,
    workAvgMs: debug.workSumMs / debug.frames,
    workMaxMs: debug.workMaxMs,
  });

  debug.frames = 0;
  debug.elapsedMs = 0;
  debug.intervalSumMs = 0;
  debug.intervalMaxMs = 0;
  debug.workSumMs = 0;
  debug.workMaxMs = 0;
}
