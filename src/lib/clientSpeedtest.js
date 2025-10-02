const DEFAULT_TIMEOUT_MS = 15000;
const DOWNLOAD_TARGETS = [
  "https://speed.cloudflare.com/__down?bytes=200000000",
  "https://speed.cloudflare.com/__down?bytes=100000000",
];
const UPLOAD_TARGETS = [
  { url: "https://speed.cloudflare.com/__up", bytes: 100000000 },
  { url: "https://speed.cloudflare.com/__up", bytes: 50000000 },
];

function withTimeout(promise, timeoutMs, label) {
  return new Promise((resolve, reject) => {
    const id = setTimeout(
      () => reject(new Error(`${label} timed out`)),
      timeoutMs
    );
    promise
      .then((value) => {
        clearTimeout(id);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(id);
        reject(error);
      });
  });
}

async function measureLatency(iterations = 5) {
  let best = Number.POSITIVE_INFINITY;
  for (let i = 0; i < iterations; i++) {
    const url = `/favicon.ico?cb=${Date.now()}-${i}`;
    const start = performance.now();
    try {
      await withTimeout(fetch(url, { cache: "no-store" }), 5000, "latency");
      const elapsed = performance.now() - start;
      if (elapsed < best) {
        best = elapsed;
      }
    } catch (e) {
      // ignore individual failures
    }
  }
  if (!Number.isFinite(best)) {
    return { latencyMs: 0, jitterMs: 0 };
  }
  // crude jitter approximation via small repeated pings
  return { latencyMs: Math.round(best), jitterMs: 0 };
}

async function fetchAndCountBytes(url, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const start = performance.now();
  const response = await withTimeout(
    fetch(url, { cache: "no-store" }),
    timeoutMs,
    "download"
  );
  const reader = response.body?.getReader?.();
  if (!reader) {
    // Fallback: use content-length header if available
    const contentLength = Number(response.headers.get("content-length") || 0);
    const elapsedSec = (performance.now() - start) / 1000;
    return { bytes: contentLength, seconds: elapsedSec };
  }
  let bytes = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) bytes += value.byteLength;
  }
  const elapsedSec = (performance.now() - start) / 1000;
  return { bytes, seconds: elapsedSec };
}

// Read a chunk with a timeout; resolves to { timeout: true } on timeout
async function readWithTimeout(reader, timeoutMs) {
  return Promise.race([
    reader.read(),
    new Promise((resolve) =>
      setTimeout(() => resolve({ timeout: true }), Math.max(0, timeoutMs))
    ),
  ]);
}

// Like fetchAndCountBytes but ensures total time does not exceed capMs.
async function fetchAndCountBytesWithCap(url, capMs) {
  const start = performance.now();
  // Ensure the initial request itself cannot exceed the cap
  const response = await withTimeout(
    fetch(url, { cache: "no-store" }),
    capMs,
    "download"
  );
  const reader = response.body?.getReader?.();
  if (!reader) {
    const contentLength = Number(response.headers.get("content-length") || 0);
    const elapsedSec = (performance.now() - start) / 1000;
    return { bytes: contentLength, seconds: elapsedSec };
  }
  let bytes = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const elapsedMs = performance.now() - start;
    const remainingMs = capMs - elapsedMs;
    if (remainingMs <= 0) {
      try {
        await reader.cancel();
      } catch (_) {
        // ignore
      }
      break;
    }
    const result = await readWithTimeout(reader, remainingMs);
    if (result && result.timeout) {
      try {
        await reader.cancel();
      } catch (_) {
        // ignore
      }
      break;
    }
    const { done, value } = result || {};
    if (done) break;
    if (value) bytes += value.byteLength;
  }
  const elapsedSec = (performance.now() - start) / 1000;
  return { bytes, seconds: elapsedSec };
}

async function measureDownload(totalTimeoutMs = 10000) {
  const startAll = performance.now();
  for (const target of DOWNLOAD_TARGETS) {
    const remainingMs = totalTimeoutMs - (performance.now() - startAll);
    if (remainingMs <= 0) break;
    try {
      const { bytes, seconds } = await fetchAndCountBytesWithCap(
        `${target}&cb=${Date.now()}`,
        remainingMs
      );
      if (seconds > 0 && bytes > 0) {
        const bits = bytes * 8;
        const mbps = bits / seconds / 1_000_000;
        return { downloadMbps: Math.round(mbps * 100) / 100 };
      }
    } catch (e) {
      // try next target
    }
  }
  // last resort: tiny file on same origin (very rough)
  try {
    const remainingMs = Math.max(
      0,
      totalTimeoutMs - (performance.now() - startAll)
    );
    if (remainingMs <= 0) return { downloadMbps: 0 };
    const { bytes, seconds } = await fetchAndCountBytesWithCap(
      `/file.svg?cb=${Date.now()}`,
      Math.min(5000, remainingMs)
    );
    const bits = bytes * 8;
    const mbps = seconds > 0 ? bits / seconds / 1_000_000 : 0;
    return { downloadMbps: Math.round(mbps * 100) / 100 };
  } catch (e) {
    return { downloadMbps: 0 };
  }
}

function createRandomPayload(byteCount) {
  // Create a deterministic but non-compressible payload
  const buffer = new Uint8Array(byteCount);
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] = (i * 31 + 7) % 256;
  }
  return buffer;
}

async function postAndMeasureBytes(url, bytes, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const payload = createRandomPayload(bytes);
  const start = performance.now();
  await withTimeout(
    fetch(`${url}?cb=${Date.now()}`, {
      method: "POST",
      // avoid browser/content encodings; send as raw bytes
      headers: {
        "content-type": "application/octet-stream",
      },
      body: payload,
      cache: "no-store",
      // Use no-cors to avoid preflight delays and CORS issues; response is opaque which is fine
      mode: "no-cors",
      // Large payloads are not compatible with keepalive limits (~64KB). Disable keepalive.
      keepalive: false,
      // Do not send credentials/cookies cross-origin
      credentials: "omit",
      referrerPolicy: "no-referrer",
    }),
    timeoutMs,
    "upload"
  );
  const elapsedSec = (performance.now() - start) / 1000;
  return { bytes, seconds: elapsedSec };
}

async function measureUpload() {
  // Slightly longer timeout to accommodate slower uplinks
  const timeoutMs = Math.max(DEFAULT_TIMEOUT_MS, 20000);
  for (const target of UPLOAD_TARGETS) {
    try {
      const { bytes, seconds } = await postAndMeasureBytes(
        target.url,
        target.bytes,
        timeoutMs
      );
      if (seconds > 0 && bytes > 0) {
        const bits = bytes * 8;
        const mbps = bits / seconds / 1_000_000;
        return { uploadMbps: Math.round(mbps * 100) / 100 };
      }
    } catch (e) {
      // try next target
    }
  }
  return { uploadMbps: 0 };
}

export async function runClientSpeedTest() {
  const { latencyMs, jitterMs } = await measureLatency();
  const { downloadMbps } = await measureDownload(10000);
  const { uploadMbps } = await measureUpload();

  return {
    downloadSpeed: downloadMbps,
    uploadSpeed: uploadMbps,
    latency: latencyMs,
    ping: latencyMs,
    jitter: jitterMs,
    testedAt: new Date().toISOString(),
  };
}
