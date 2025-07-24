export default {
  expo: {
    name: "Ciudad Activa",
    slug: "ciudad-activa",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.ciudadactiva.mobile",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF",
      },
      package: "com.ciudadactiva.mobile",
      permissions: ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION", "CAMERA"],
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro",
    },
    plugins: [
      "expo-router",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "Esta app necesita acceso a tu ubicación para mostrar tu posición en el mapa y reportar incidentes.",
        },
      ],
    ],
    extra: {
      mapboxToken: process.env.EXPO_PUBLIC_MAPBOX_TOKEN,
    },
  },
};
