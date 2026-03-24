(function (global) {
  const navigation = global.Routing?.navigation;

  if (!navigation || typeof navigation.initRouter !== "function") {
    throw new Error("Routing bootstrap failed: navigation module is missing.");
  }

  navigation.initRouter("flexible_main");
})(window);
