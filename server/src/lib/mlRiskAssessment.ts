import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

interface MLModel {
  features: string[];
  classes: RiskLevel[];
  coefficients: number[][];
  intercepts: number[];
}

const modelPath = fileURLToPath(
  new URL('../../../ml/model/risk_model.json', import.meta.url),
);

const model: MLModel = JSON.parse(
  readFileSync(modelPath, 'utf-8'),
);

export interface MLRiskSignals {
  failedAttempts: number;
  newIp: boolean;
  newDevice: boolean;
  unusualLoginTime: boolean;
}

export function assessMLRisk(
  signals: MLRiskSignals,
): { level: RiskLevel; confidence: number } {
  const values = [
    signals.failedAttempts,
    Number(signals.newIp),
    Number(signals.newDevice),
    Number(signals.unusualLoginTime),
  ];

  const logits: number[] = [];

  for (let classIndex = 0; classIndex < model.classes.length; classIndex++) {
    const intercept = model.intercepts[classIndex];
    const coefficients = model.coefficients[classIndex];

    if (intercept === undefined || coefficients === undefined) {
      throw new Error('Invalid ML risk model');
    }

    let logit = intercept;

    for (let i = 0; i < values.length; i++) {
      const coefficient = coefficients[i];
      const value = values[i];

      if (coefficient === undefined || value === undefined) {
        throw new Error('Invalid ML risk model features');
      }

      logit += coefficient * value;
    }

    logits.push(logit);
  }

  if (logits.length === 0) {
    throw new Error('ML risk model has no classes');
  }

  const maxLogit = logits.reduce(
    (max, value) => Math.max(max, value),
    -Infinity,
  );

  const exponentials = logits.map(
    (value) => Math.exp(value - maxLogit),
  );

  const total = exponentials.reduce(
    (sum, value) => sum + value,
    0,
  );

  const probabilities = exponentials.map(
    (value) => value / total,
  );

  let predictedIndex = 0;

  for (let i = 1; i < probabilities.length; i++) {
    const current = probabilities[i];
    const best = probabilities[predictedIndex];

    if (
      current !== undefined &&
      best !== undefined &&
      current > best
    ) {
      predictedIndex = i;
    }
  }

  const predictedLevel = model.classes[predictedIndex];
  const confidence = probabilities[predictedIndex];

  if (predictedLevel === undefined || confidence === undefined) {
    throw new Error('Unable to calculate ML risk prediction');
  }

  return {
    level: predictedLevel,
    confidence,
  };
}