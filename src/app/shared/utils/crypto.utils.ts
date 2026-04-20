/**
 * Hashes a string using SHA-256 for privacy-preserving contact sync.
 * @param input The plaintext string (e.g., E.164 phone number)
 * @returns The hex-encoded SHA-256 hash
 */
export async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
