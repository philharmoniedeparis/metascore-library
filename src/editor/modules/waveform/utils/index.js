export function getScaleForWidth(waveformData, width) {
  // See https://github.com/bbc/waveform-data.js/blob/afeb95b61482deeb1e5852b4d231236e8ee34433/src/waveform-data.js#L333C19-L333C78
  const scale = Math.floor(
    (waveformData.duration * waveformData.sample_rate) / width
  );
  return Math.max(scale, waveformData.scale);
}
