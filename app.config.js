export default {
  expo: {
    name: "Alsaif Analysis",
    slug: "elsaif-analysis",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/logo.png",
    userInterfaceStyle: "light",
    newArchEnabled: false,
    scheme: "alsaif-analysis",
    experiments: {
      tsconfigPaths: true
    },
    assetBundlePatterns: [
      "**/*"
    ],
    splash: {
      image: "./assets/logo.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.elsaifanalysis.app",
      googleServicesFile: "./GoogleService-Info.plist"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.elsaifanalysis.app",
      googleServicesFile: "./google-services.json",
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false
    },
    web: {
      favicon: "./assets/logo.png"
    },
    plugins: [
      "@react-native-firebase/app",
      "@react-native-community/datetimepicker",
      [
        "onesignal-expo-plugin",
        {
          mode: "development"
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "dc84a962-713a-4ddd-b04e-77a6a119f648"
      },
      apiBaseUrl: process.env.API_BASE_URL || "https://elsaif-backend-persistent.onrender.com",
      apiTimeout: process.env.API_TIMEOUT || "30000",
      enableLogging: process.env.ENABLE_LOGGING === "true",
      logLevel: process.env.LOG_LEVEL || "debug"
    }
  }
};
