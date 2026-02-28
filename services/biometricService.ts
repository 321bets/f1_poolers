const BIOMETRIC_CREDENTIALS_KEY = 'f1poolers_biometric_credentials';

interface StoredCredential {
  credentialId: string;
  username: string;
  userId: string;
}

const getStoredCredentials = (): StoredCredential[] => {
  try {
    const stored = localStorage.getItem(BIOMETRIC_CREDENTIALS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveCredentials = (creds: StoredCredential[]) => {
  localStorage.setItem(BIOMETRIC_CREDENTIALS_KEY, JSON.stringify(creds));
};

const bufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const base64ToBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

export const isBiometricAvailable = async (): Promise<boolean> => {
  if (!window.PublicKeyCredential) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
};

export const hasStoredCredentials = (): boolean => {
  return getStoredCredentials().length > 0;
};

export const registerBiometric = async (userId: string, username: string): Promise<boolean> => {
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const userIdBuffer = new TextEncoder().encode(userId);

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: 'F1 Poolers',
          id: window.location.hostname,
        },
        user: {
          id: userIdBuffer,
          name: username,
          displayName: username,
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },   // ES256
          { alg: -257, type: 'public-key' },  // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred',
        },
        timeout: 60000,
        attestation: 'none',
      },
    }) as PublicKeyCredential | null;

    if (!credential) return false;

    const credentialId = bufferToBase64(credential.rawId);
    const creds = getStoredCredentials().filter(c => c.username !== username);
    creds.push({ credentialId, username, userId });
    saveCredentials(creds);

    return true;
  } catch (e) {
    console.error('Biometric registration failed:', e);
    return false;
  }
};

export const authenticateBiometric = async (): Promise<string | null> => {
  try {
    const storedCreds = getStoredCredentials();
    if (storedCreds.length === 0) return null;

    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const allowCredentials = storedCreds.map(c => ({
      id: base64ToBuffer(c.credentialId),
      type: 'public-key' as const,
      transports: ['internal' as AuthenticatorTransport],
    }));

    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials,
        userVerification: 'required',
        timeout: 60000,
        rpId: window.location.hostname,
      },
    }) as PublicKeyCredential | null;

    if (!assertion) return null;

    const usedCredentialId = bufferToBase64(assertion.rawId);
    const matched = storedCreds.find(c => c.credentialId === usedCredentialId);

    return matched?.username || null;
  } catch (e) {
    console.error('Biometric authentication failed:', e);
    return null;
  }
};
