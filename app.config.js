module.exports = {
  android: {
    edgeToEdgeEnabled: true,
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: "com.draftbit.newapp",
    versionCode: 1,
  },
  assetBundlePatterns: ["**/*"],
  experiments: { typedRoutes: true, tsconfigPaths: true },
  icon: "./assets/images/icon.png",
  ios: { supportsTablet: true, buildNumber: "1", bundleIdentifier: "com.draftbit.newapp" },
  name: "new-app",
  orientation: "portrait",
  plugins: [
    "expo-font",
    "expo-asset",
    "expo-video",
    "expo-web-browser",

    [
      "expo-router",
      {
        origin: "https://89a7a78eac.sandbox.draftbit.dev:5101",
        headOrigin: "https://89a7a78eac.sandbox.draftbit.dev:5100",
      },
    ],
    ["./plugins/draftbit-auto-launch-url-plugin"],
  ],

  scheme: "new-app",
  slug: "new-app",
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  userInterfaceStyle: "automatic",
  version: "1.0.0",
  web: { bundler: "metro", output: "single", favicon: "./assets/images/favicon.png" },
  platforms: ["ios", "android", "web"],
};
