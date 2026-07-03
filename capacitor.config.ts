import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.noqyris.polymerge',
  appName: 'Polymerge',
  webDir: 'dist',
  // Match the app background so there is no white flash while the web view loads.
  backgroundColor: '#E4E7EC',
  ios: {
    contentInset: 'never',
  },
}

export default config
