import { watch, unref } from "vue";
import { useModule } from "@core/services/module-manager";

export interface CuePointOptions {
  startTime?: number
  endTime?: number
  once?: boolean
  onStart ?: (event: { time: number, cuepoint: CuePoint }) => void
  onUpdate?: (event: { time: number, cuepoint: CuePoint }) => void
  onSeekout?: (event: { time: number, cuepoint: CuePoint }) => void
  onStop?: (event: { time: number, cuepoint: CuePoint }) => void
  onDestroy?: () => void
  considerError?: boolean
}

export interface CuePoint extends CuePointOptions {
  running: boolean
}

let cuepoints = [] as CuePoint[];
const seeking = false;
let trackErrors = false;
let maxError = 0;
let previousTime = null as number|null;

function addCuepoint(options: CuePointOptions) {
  const cuepoint = {
    ...options,
    running: false
  }
  cuepoints.push(cuepoint);

  trackErrors = trackErrors || (cuepoint.considerError ?? true);

  const { time } = useModule("core:media_player");
  updateCuepoint(cuepoint, unref(time));

  return cuepoint;
}

function removeCuepoint(cuepoint: CuePoint) {
  if (cuepoint.onDestroy) {
    try {
      cuepoint.onDestroy();
    } catch (e) {
      console.error(e);
    }
  }

  cuepoints = cuepoints.filter((c) => c !== cuepoint);
}

function clearCuepoints() {
  cuepoints = [];
}

function updateCuepoint(cuepoint: CuePoint, time: number, seeked = false) {
  if (seeking) return;

  if (!cuepoint.running) {
    if (
      (typeof cuepoint.startTime === "undefined" || cuepoint.startTime <= time) &&
      (typeof cuepoint.endTime === "undefined" || cuepoint.endTime > time)
    ) {
      cuepoint.running = true;

      if (cuepoint.onStart) {
        cuepoint.onStart({ time, cuepoint });
      }
      if (cuepoint.onUpdate) {
        cuepoint.onUpdate({ time, cuepoint });
      }
      return;
    }
  } else {
    if (cuepoint.onUpdate) {
      cuepoint.onUpdate({ time, cuepoint });
    }

    if (
      (typeof cuepoint.endTime !== "undefined" && cuepoint.endTime < time + maxError) ||
      (seeked && typeof cuepoint.startTime !== "undefined" && cuepoint.startTime > time)
    ) {
      cuepoint.running = false;

      if (seeked && cuepoint.onSeekout) {
        cuepoint.onSeekout({ time, cuepoint });
      }
      if (cuepoint.onStop) {
        cuepoint.onStop({ time, cuepoint });
      }
      if (cuepoint.once) {
        removeCuepoint(cuepoint);
      }
    }
  }
}

function updateCuepoints(time: number, seeked = false) {
  cuepoints.forEach((cuepoint) => {
    updateCuepoint(cuepoint, time, seeked);
  });
}

function init() {
  const { time: mediaTime, seeking: mediaSeeking } = useModule("core:media_player");
  watch(mediaTime, (value) => {
    // Don't update if seeking.
    if (mediaSeeking.value) return;

    if (trackErrors) {
      if (previousTime !== null) {
        maxError = Math.max(maxError, Math.abs(value - previousTime));
      }
      previousTime = value;
    }
    updateCuepoints(value);
  });
  watch(mediaSeeking, (value) => {
    if (!value) {
      const time = unref(mediaTime);
      if (trackErrors) {
        maxError = 0;
        previousTime = time;
      }
      updateCuepoints(time, true);
    }
  });
}

export { init, addCuepoint, removeCuepoint, clearCuepoints };