const pendingMFA = new Map<string, number>();

const MFA_TIMEOUT = 5 * 60 * 1000;

export function markPendingMFA(sessionId: string) {
  pendingMFA.set(sessionId, Date.now() + MFA_TIMEOUT);
}

export function isPendingMFA(sessionId: string) {
  const expiresAt = pendingMFA.get(sessionId);

  if (!expiresAt) {
    return false;
  }

  if (Date.now() > expiresAt) {
    pendingMFA.delete(sessionId);
    return false;
  }

  return true;
}

export function completeMFA(sessionId: string) {
  pendingMFA.delete(sessionId);
}