import { DistanceUnits, UniversalSpeedTest } from "universal-speedtest";

const DEFAULT_RESULT = {
  downloadSpeed: 0,
  uploadSpeed: 0,
  latency: 0,
  ping: 0,
  jitter: 0,
};

function toNumber(value, fallback = 0) {
  if (typeof value !== "number") {
    return fallback;
  }
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return value;
}

export async function runServerSpeedTest() {
  const tester = new UniversalSpeedTest({
    debug: process.env.NODE_ENV !== "production",
    tests: {
      measureDownload: true,
      measureUpload: true,
    },
    units: {
      distanceUnit: DistanceUnits.km,
    },
  });

  try {
    const result = await tester.performOoklaTest();

    const downloadSpeed = toNumber(result?.downloadResult?.speed);
    const uploadSpeed = toNumber(result?.uploadResult?.speed);
    const latency = toNumber(result?.pingResult?.latency);
    const jitter = toNumber(result?.pingResult?.jitter);
    const ping = toNumber(result?.pingResult?.latency, latency);

    return {
      downloadSpeed,
      uploadSpeed,
      latency,
      ping,
      jitter,
      testedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[speedy] Failed to run Ookla speed test", error);
    return {
      ...DEFAULT_RESULT,
      testedAt: new Date().toISOString(),
      error: error?.message ?? "Speed test failed",
    };
  }
}
