export default {
  expo: {
    name: "Ciudad Activa",
    slug: "ciudad-activa",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.ciudadactiva.mobile",
    },
    android: {
      package: "com.ciudadactiva.mobile",
      permissions: ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"],
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon:
        "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f3db-fe0f.png",
    },
    plugins: ["expo-router"],
    extra: {
      mapboxToken: process.env.EXPO_PUBLIC_MAPBOX_TOKEN,
    },
  },
};
