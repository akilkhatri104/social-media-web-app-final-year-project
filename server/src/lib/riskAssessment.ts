export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface RiskSignals {
  failedAttempts: number;
  newDevice: boolean;
  newIP: boolean;
  unusualLoginTime: boolean;
}

export interface RiskAssessment {
  score: number;
  level: RiskLevel;
}

export function assessRisk(signals: RiskSignals): RiskAssessment {
  let score = 0;

  // Repeated failed login attempts
  if (signals.failedAttempts >= 3) {
    score += 4;
  } else if (signals.failedAttempts >= 1) {
    score += 2;
  }

  // Login from an unrecognized device
  if (signals.newDevice) {
    score += 2;
  }

  // Login from an unfamiliar IP address
  if (signals.newIP) {
    score += 2;
  }

  // Login at an unusual time
  if (signals.unusualLoginTime) {
    score += 1;
  }

  let level: RiskLevel;

  if (score >= 6) {
    level = "HIGH";
  } else if (score >= 3) {
    level = "MEDIUM";
  } else {
    level = "LOW";
  }

  return {
    score,
    level,
  };
}