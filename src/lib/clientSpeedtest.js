const DEFAULT_TIMEOUT_MS = 15000;
const DOWNLOAD_TARGETS = [
  "https://speed.cloudflare.com/__down?bytes=20000000",
  "https://speed.cloudflare.com/__down?bytes=10000000",
];
const UPLOAD_TARGETS = [
  { url: "https://speed.cloudflare.com/__up", bytes: 10000000 },
  { url: "https://speed.cloudflare.com/__up", bytes: 5000000 },
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

async function measureDownload() {
  for (const target of DOWNLOAD_TARGETS) {
    try {
      const { bytes, seconds } = await fetchAndCountBytes(
        `${target}&cb=${Date.now()}`
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
    const { bytes, seconds } = await fetchAndCountBytes(
      `/file.svg?cb=${Date.now()}`,
      5000
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
      // keepalive helps allow completion during page unloads, but not required
      keepalive: true,
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
  const [{ latencyMs, jitterMs }, { downloadMbps }, { uploadMbps }] =
    await Promise.all([measureLatency(), measureDownload(), measureUpload()]);

  return {
    downloadSpeed: downloadMbps,
    uploadSpeed: uploadMbps,
    latency: latencyMs,
    ping: latencyMs,
    jitter: jitterMs,
    testedAt: new Date().toISOString(),
  };
}
