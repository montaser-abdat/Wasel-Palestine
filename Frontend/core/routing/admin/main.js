(function (global) {
  const navigation = global.AdminRouting?.navigation;

  if (!navigation || typeof navigation.initRouter !== "function") {
    throw new Error("Admin routing bootstrap failed: navigation module is missing.");
  }

  navigation.initRouter("flexible_main");
})(window);
