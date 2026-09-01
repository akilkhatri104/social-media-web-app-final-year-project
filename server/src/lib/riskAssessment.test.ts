import { assessRisk } from "./riskAssessment.ts";

console.log(
  "LOW:",
  assessRisk({
    failedAttempts: 0,
    newDevice: false,
    newIP: false,
    unusualLoginTime: false,
  })
);

console.log(
  "MEDIUM:",
  assessRisk({
    failedAttempts: 1,
    newDevice: true,
    newIP: false,
    unusualLoginTime: false,
  })
);

console.log(
  "HIGH:",
  assessRisk({
    failedAttempts: 3,
    newDevice: true,
    newIP: true,
    unusualLoginTime: true,
  })
);