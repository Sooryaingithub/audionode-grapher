import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.4bde6e9c41834a70a52b4c084ba4b3a7',
  appName: 'Audio Knowledge Graph',
  webDir: 'dist',
  server: {
    url: 'https://4bde6e9c-4183-4a70-a52b-4c084ba4b3a7.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'automatic',
    scheme: 'App'
  }
};

export default config;
