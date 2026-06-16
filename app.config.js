module.exports = {
  expo: {
    name: "nyhemsveckan",
    slug: "nyhemsveckan",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "nyhemsveckan",
    userInterfaceStyle: "automatic",
    assetBundlePatterns: ["**/*"],
    platforms: ["ios", "android", "web"],
    experiments: { typedRoutes: true, tsconfigPaths: true },
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    android: {
      edgeToEdgeEnabled: true,
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.linusanderas.nyhem",
      versionCode: 1,
    },
    ios: {
      supportsTablet: true,
      buildNumber: "1",
      bundleIdentifier: "com.linusanderas.nyhem",
    },
    web: { bundler: "metro", output: "single", favicon: "./assets/images/favicon.png" },
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
    extra: {
      eas: {
        projectId: "80b7db6b-50d5-40a9-983b-28e2fdf735e5",
      },
    },
  },
};
