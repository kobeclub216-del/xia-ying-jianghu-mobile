/* A4-59-M8-C3: approved M8-C2 running sheets, shared by gameplay and lab. */
const a459RunAnimation = (() => {
  const frames = Array.from({length: 8}, (_, i) => [i * 224, 0, 224, 240, 134, 216]);
  const clips = {
    '男': {file: 'male-swordsman-m8c2-run.png', frames, ms: 80, scale: 0.46},
    '女': {file: 'female-swordsman-m8c2-run.png', frames, ms: 80, scale: 0.46}
  };
  return {
    clip(sex) { return clips[sex]; },
    frame(clip, time) { return clip.frames[Math.floor(time / clip.ms) % clip.frames.length]; },
    ready(image) { return image.complete && image.naturalWidth === 1792 && image.naturalHeight === 240; }
  };
})();
