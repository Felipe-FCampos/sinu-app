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
    url: 'http://192.168.0.138:3000',
    cleartext: true,
  },
};

export default config;
