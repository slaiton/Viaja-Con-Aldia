import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.viajaconaldia',
  appName: 'Viaja con aldia',
  webDir: 'www',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    hostname: '3slogistica.com'
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_launcher",
      iconColor: "#488AFF"
    }
  }
};


export default config;
