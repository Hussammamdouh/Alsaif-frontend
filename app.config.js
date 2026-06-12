export default {
  expo: {
    name: "Alsaif Analysis",
    slug: "elsaif-analysis",
    version: "1.0.3",
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
      image: "./assets/Logo Secondry.jpg",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.elsaifanalysis.app",
      googleServicesFile: "./GoogleService-Info.plist",
      entitlements: {
        "keychain-access-groups": [
          "$(AppIdentifierPrefix)com.elsaifanalysis.app"
        ]
      }
    },
    android: {
      versionCode: 13,
      adaptiveIcon: {
        foregroundImage: "./assets/logo.png",
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
        projectId: "e6f53f3b-43d3-4d4b-bbba-cfc35c5cd92b"
      },
      apiBaseUrl: process.env.API_BASE_URL || "https://api.alsaifanalysis.com",
      apiTimeout: process.env.API_TIMEOUT || "30000",
      enableLogging: process.env.ENABLE_LOGGING === "true",
      logLevel: process.env.LOG_LEVEL || "debug"
    }
  }
};
