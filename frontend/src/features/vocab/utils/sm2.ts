export interface SM2State {
  interval: number;
  easeFactor: number;
  repetitions: number;
}

export interface SM2Result extends SM2State {
  nextReviewAt: string;
  lastReviewAt: string;
}

export function applySM2(current: SM2State | null, quality: number): SM2Result {
  const MIN_EF = 1.3;
  const DEFAULT_EF = 2.5;

  let { interval = 1, easeFactor = DEFAULT_EF, repetitions = 0 } = current ?? {};

  if (quality >= 3) {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions++;
  } else {
    repetitions = 0;
    interval = 1;
  }

  easeFactor = Math.max(
    MIN_EF,
    easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  );

  const now = new Date();
  const next = new Date(now);
  next.setDate(next.getDate() + interval);

  return {
    interval,
    easeFactor: Math.round(easeFactor * 100) / 100,
    repetitions,
    nextReviewAt: next.toISOString(),
    lastReviewAt: now.toISOString(),
  };
}
