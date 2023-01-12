import { watch, unref } from "vue";
import { useModule } from "@metascore-library/core/services/module-manager";

let cuepoints = [];
let seeking = false;
let trackErrors = false;
let maxError = 0;
let previousTime = null;

function addCuepoint({
  startTime,
  endTime,
  onStart = null,
  onUpdate = null,
  onSeekout = null,
  onStop = null,
  onDestroy = null,
  considerError = true,
}) {
  const cuepoint = {
    startTime,
    endTime,
    onStart,
    onUpdate,
    onSeekout,
    onStop,
    onDestroy,
    considerError,
    running: false,
  };
  cuepoints.push(cuepoint);

  trackErrors = trackErrors || considerError;

  const { time } = useModule("media_player");
  updateCuepoint(cuepoint, unref(time));

  return cuepoint;
}

function removeCuepoint(cuepoint) {
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

function updateCuepoint(cuepoint, time, seeked = false) {
  if (seeking) return;

  if (!cuepoint.running) {
    if (
      (cuepoint.startTime === null || cuepoint.startTime <= time) &&
      (cuepoint.endTime === null || cuepoint.endTime > time)
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
      (cuepoint.endTime !== null && cuepoint.endTime < time + maxError) ||
      (seeked && cuepoint.startTime !== null && cuepoint.startTime > time)
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

function updateCuepoints(time, seeked = false) {
  cuepoints.forEach((cuepoint) => {
    updateCuepoint(cuepoint, time, seeked);
  });
}

function init() {
  const { time: mediaTime, seeking: mediaSeeking } = useModule("media_player");
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
