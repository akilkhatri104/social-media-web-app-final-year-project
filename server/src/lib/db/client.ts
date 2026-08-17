import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema.ts';
import * as authSchema from '../auth-schema.ts';

import { getEnv } from '../validateEnv.js';
const sql = neon(getEnv('DATABASE_URL'));

export const db = drizzle(sql, { schema: { ...schema, ...authSchema } });
