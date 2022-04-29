import { watch } from "vue";
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
  considerError = true,
}) {
  const cuepoint = {
    startTime,
    endTime,
    onStart,
    onUpdate,
    onSeekout,
    onStop,
    considerError,
    running: false,
  };
  cuepoints.push(cuepoint);

  trackErrors = trackErrors || considerError;

  return cuepoint;
}

function removeCuepoint(cuepoint) {
  cuepoints = cuepoints.filter((c) => c !== cuepoint);
}

function clearCuepoints() {
  cuepoints = [];
}

function updateCuepoints(time, seeked = false) {
  if (seeking) {
    return;
  }

  cuepoints.forEach((cuepoint, index) => {
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

      if (cuepoint.endTime !== null && cuepoint.endTime <= time + maxError) {
        cuepoint.running = false;

        if (seeked && cuepoint.onSeekout) {
          cuepoint.onSeekout({ time, cuepoint });
        }
        if (cuepoint.onStop) {
          cuepoint.onStop({ time, cuepoint });
        }
        if (cuepoint.once) {
          cuepoints.splice(index, 1);
        }
      }
    }
  });
}

function init() {
  const mediaStore = useModule("media_player").store;
  watch(
    () => mediaStore.time,
    (value) => {
      if (trackErrors) {
        if (previousTime !== null) {
          maxError = Math.max(maxError, Math.abs(value - previousTime));
        }
        previousTime = value;
      }
      updateCuepoints(value);
    }
  );
  watch(
    () => mediaStore.seeking,
    (value) => {
      seeking = value;

      if (!value) {
        if (trackErrors) {
          maxError = 0;
          previousTime = mediaStore.time;
        }
        updateCuepoints(mediaStore.time, true);
      }
    }
  );
}

export { init, addCuepoint, removeCuepoint, clearCuepoints };
