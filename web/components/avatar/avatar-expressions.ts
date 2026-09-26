import {
  bakePose,
  poseVars,
  thinking,
  surprised,
  type Expression,
} from "blobatar/expression";

export type ExpressionId =
  | "listening"
  | "thinking"
  | "speaking"
  | "neutral"
  | "happy"
  | "excited"
  | "curious"
  | "interested"
  | "focused"
  | "surprised"
  | "confused"
  | "shy"
  | "muted"
  | "muted-glance"
  | "muted-drowsy";

export interface ExpressionConfig {
  id: ExpressionId;
  label: string;
  expression: Expression;
}

/** Helper to construct precise Blobatar eye poses with rock-solid body (bdy = 0) */
export function makePose(p: Partial<Expression["p"]>): Expression {
  return {
    p: {
      esx: 1,
      esy: 1,
      tilt: 0,
      edy: 0,
      edx: 0,
      esx2: 0,
      esy2: 0,
      tilt2: 0,
      edy2: 0,
      lock: 1,
      heat: 0,
      shake: 0,
      rock: 0,
      ...p,
      bdy: 0, // Triangle body stays 100% constant and identical across all emotions
    },
    vars: poseVars,
    bake: bakePose,
  };
}

/** Dynamically enhance an expression with live microphone audio energy */
export function makeAudioPerkedPose(baseExpression: Expression, audioLevel: number): Expression {
  const p = baseExpression.p;
  // Non-linear response so natural speaking triggers responsive eye perks
  const boost = Math.min(1, Math.pow(Math.max(0, audioLevel), 0.7) * 1.6);
  return makePose({
    ...p,
    esx: (p.esx ?? 1) + boost * 0.32,
    esy: (p.esy ?? 1) + boost * 0.62, // eyes pop prominently wide and tall when the visitor speaks
    edy: (p.edy ?? 0) - boost * 2.8,  // lifted alert attention
    edx: (p.edx ?? 0) * (1 - boost * 0.5), // focused convergence straight at visitor
  });
}

// Thinking expression wrapped to ensure zero body movement
const fixedThinking: Expression = {
  ...thinking,
  p: {
    ...thinking.p,
    bdy: 0,
  },
};

/**
 * Curated Expressions for Mr. Triangle:
 * The triangle body geometry remains 100% constant and stable.
 */
export const EXPRESSIONS_CATALOG: ExpressionConfig[] = [
  {
    id: "listening",
    label: "Listening",
    expression: makePose({
      esx: 1.28,
      esy: 1.42,   // popped tall and round: alert, wide-open eyes
      tilt: -3,
      edy: -1.8,   // eyes lifted up
      edx: 0.25,
    }),
  },
  {
    id: "thinking",
    label: "Thinking",
    expression: fixedThinking,
  },
  {
    id: "speaking",
    label: "Speaking",
    expression: makePose({
      esx: 1.16,
      esy: 1.22,   // bright, engaged eyes talking directly with visitor
      tilt: 3,
      edy: -1.4,
      edx: 0.22,
      esx2: 0.04,
      esy2: 0.02,
      tilt2: -6,
    }),
  },
  {
    id: "neutral",
    label: "Neutral",
    expression: makePose({ esx: 1.05, esy: 1.0, tilt: 0, edy: 0, edx: 0 }),
  },
  {
    id: "happy",
    label: "Happy",
    expression: makePose({
      esx: 1.24,
      esy: 0.92,   // warm, smiling eye shape that keeps pupils and life
      tilt: 5,     // gentle joyful tilt
      tilt2: -5,   // symmetric warm lift
      edy: -1.7,   // lifted with delight
      edx: 0.18,
    }),
  },
  {
    id: "excited",
    label: "Excited",
    expression: makePose({
      esx: 1.28,
      esy: 1.18,   // bright, wide, joyful eyes
      tilt: 4,
      tilt2: -4,
      edy: -2.0,
      edx: 0.25,
    }),
  },
  {
    id: "muted",
    label: "Muted",
    expression: makePose({
      esx: 0.95,
      esy: 0.85,   // soft, relaxed round eyes — maintains natural portrait capsule shape
      tilt: 2,
      tilt2: -2,
      edy: 0.8,    // resting slightly lower, calm and observant
      edx: 0.15,
    }),
  },
  {
    id: "muted-glance",
    label: "Muted — Glancing",
    expression: makePose({
      esx: 0.95,
      esy: 0.82,
      tilt: 2,
      edy: 0.5,
      edx: 2.2,    // gentle glance to the side
      tilt2: -4,
    }),
  },
  {
    id: "muted-drowsy",
    label: "Muted — Drowsy",
    expression: makePose({
      esx: 0.98,
      esy: 0.78,   // relaxed, calm resting gaze (retains vertical capsule anatomy)
      tilt: 1,
      edy: 1.2,
      edx: 0.1,
      tilt2: -1,
    }),
  },
  {
    id: "curious",
    label: "Curious",
    expression: makePose({
      esx: 1.15,
      esy: 1.1,
      tilt: 16,
      tilt2: -32,
      edy: -1.2,
    }),
  },
  {
    id: "interested",
    label: "Interested",
    expression: makePose({ esx: 1.25, esy: 1.28, tilt: -3, edy: -1.4, edx: 0.2 }),
  },
  {
    id: "focused",
    label: "Focused",
    expression: makePose({ esx: 1.42, esy: 0.42, tilt: 0, edy: 0.5, edx: 0.4 }),
  },
  {
    id: "surprised",
    label: "Surprised",
    expression: {
      ...surprised,
      p: {
        ...surprised.p,
        bdy: 0,
      },
    },
  },
  {
    id: "confused",
    label: "Confused",
    expression: makePose({
      esx: 1.05,
      esy: 0.95,
      tilt: 14,
      edy: -0.4,
      edx: 0.3,
      tilt2: -28,
      edy2: 2.8,
    }),
  },
  {
    id: "shy",
    label: "Shy",
    expression: makePose({
      esx: 0.82,
      esy: 0.72,  // smaller, softer eyes looking down
      tilt: 8,     // shy inward gaze
      edy: 3.2,    // eyes go down toward bottom of the face
      edx: 0.45,
    }),
  },
];
