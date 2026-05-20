/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_AI_MODEL?: string;
  readonly VITE_ADMIN_USER_ID?: string;
  readonly VITE_ADMIN_PASSWORD?: string;
  readonly VITE_AUTH_SESSION_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
