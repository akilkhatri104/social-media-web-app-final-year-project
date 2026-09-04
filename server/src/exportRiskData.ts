import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import { db } from './lib/db/client.ts';
import { authRiskEvent } from './lib/db/schema.ts';

const events = await db
  .select({
    failedAttempts: authRiskEvent.failedAttempts,
    newIp: authRiskEvent.newIp,
    newDevice: authRiskEvent.newDevice,
    unusualLoginTime: authRiskEvent.unusualLoginTime,
    riskScore: authRiskEvent.riskScore,
    riskLevel: authRiskEvent.riskLevel,
    success: authRiskEvent.success,
  })
  .from(authRiskEvent);

const header =
  'failedAttempts,newIp,newDevice,unusualLoginTime,riskScore,riskLevel,success\n';

const rows = events
  .map((e) =>
    [
      e.failedAttempts,
      Number(e.newIp),
      Number(e.newDevice),
      Number(e.unusualLoginTime),
      e.riskScore,
      e.riskLevel,
      Number(e.success),
    ].join(','),
  )
  .join('\n');

writeFileSync('../auth-risk-dataset.csv', header + rows);

console.log(`Exported ${events.length} authentication events.`);