export default {
  expo: {
    name: "TontineG-One",
    slug: "tontineone",

    android: {
      package: "com.basamba1990.tontineone"
    },

    plugins: ["expo-router"],

    extra: {
      EXPO_ROUTER_APP_ROOT: "app",
      eas: {
        projectId: "e6c0dbc2-ddc3-47c1-a01f-7ccbfc64c5b0"
      }
    }
  }
};
