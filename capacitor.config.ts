import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sinu.app',
  appName: 'Sinu',
  webDir: 'dist',
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com'],
    },
  },
  server: {
    url: 'https://sinuapp.com',
    cleartext: true,
  },
};

export default config;
