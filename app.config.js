export default {
  expo: {
    name: "Alsaif Analysis",
    slug: "elsaif-analysis",
    version: "1.0.4",
    orientation: "portrait",
    icon: "./assets/Logo Secondry.jpg",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    scheme: "alsaif-analysis",
    updates: {
      enabled: false
    },
    experiments: {
      tsconfigPaths: true
    },
    assetBundlePatterns: [
      "**/*"
    ],
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#438730",
      dark: {
        image: "./assets/splash-dark.png",
        backgroundColor: "#438730"
      }
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.alsaifanalysis.com",
      googleServicesFile: "./GoogleService-Info.plist",
      buildNumber: process.env.BUILD_NUMBER || "2",
      infoPlist: {
        NSPhotoLibraryUsageDescription: "This app requires access to your photo library to allow you to select and upload a profile picture or avatar for your user account.",
        NSCameraUsageDescription: "This app requires access to your camera to allow you to take a photo to use as a profile picture or avatar for your user account.",
        NSPhotoLibraryAddUsageDescription: "This app requires access to save corporate disclosures, insights, and report screenshots directly to your photo library.",
        NSLocationWhenInUseUsageDescription: "This app requires access to your location when open to provide region-specific financial markets and insights relevant to your area."
      },
      entitlements: {
        "keychain-access-groups": [
          "$(AppIdentifierPrefix)com.alsaifanalysis.com"
        ]
      }
    },
    android: {
      versionCode: 24,
      adaptiveIcon: {
        foregroundImage: "./assets/Logo Secondry.jpg",
        backgroundColor: "#ffffff"
      },
      package: "com.alsaifanalysis.app",
      googleServicesFile: "./google-services.json",
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false
    },
    web: {
      favicon: "./assets/Logo Secondry.jpg"
    },
    plugins: [
      "@react-native-firebase/app",
      "@react-native-community/datetimepicker",
      "react-native-iap",
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
