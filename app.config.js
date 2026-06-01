export default {
  expo: {
    name: "Alsaif Analysis",
    slug: "elsaif-analysis",
    owner: "hussammamdouh47s-organization",
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
        projectId: "494ba430-d42f-408f-a81d-6181f1ce6e0d"
      },
      apiBaseUrl: process.env.API_BASE_URL || "https://api.alsaifanalysis.com",
      apiTimeout: process.env.API_TIMEOUT || "30000",
      enableLogging: process.env.ENABLE_LOGGING === "true",
      logLevel: process.env.LOG_LEVEL || "debug"
    }
  }
};
