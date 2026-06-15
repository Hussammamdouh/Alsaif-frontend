export default {
  expo: {
    name: "Alsaif Analysis",
    slug: "elsaif-analysis",
    version: "1.0.4",
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
      image: "./assets/Logo_Secondry.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.alsaifanalysis.com",
      googleServicesFile: "./GoogleService-Info.plist",
      buildNumber: process.env.BUILD_NUMBER || "2",
      entitlements: {
        "keychain-access-groups": [
          "$(AppIdentifierPrefix)com.alsaifanalysis.com"
        ]
      }
    },
    android: {
      versionCode: process.env.BUILD_NUMBER ? parseInt(process.env.BUILD_NUMBER, 10) : 14,
      adaptiveIcon: {
        foregroundImage: "./assets/logo.png",
        backgroundColor: "#ffffff"
      },
      package: "com.alsaifanalysis.app",
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
