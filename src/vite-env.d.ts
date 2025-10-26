/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly OPENWEATHERMAP_API_KEY: string
  readonly GEMINI_API_KEY: string
  readonly GOOGLE_MAPS_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
