(function (global) {
  const routing = (global.Routing = global.Routing || {});
  const config = routing.config || {};

  function normalizeRoute(routeValue, defaultRoute) {
    const fallback = defaultRoute || config.DEFAULT_ROUTE || "home";
    const value = String(routeValue || "")
      .replace(/^#/, "")
      .trim()
      .toLowerCase();

    if (!value) return fallback;
    if (value === "routeplanner") return "route-planner";
    return value;
  }

  function getRoutePath(routeKey) {
    const routePaths = config.ROUTE_PATHS || {};
    return routePaths[routeKey] || routePaths[404];
  }

  function extractPageContent(htmlText, routeKey) {
    const doc = new DOMParser().parseFromString(htmlText, "text/html");
    const namespaces = config.PAGE_NAMESPACE_SELECTORS || {};
    const namespacedRoot = doc.querySelector(namespaces[routeKey] || "");

    if (namespacedRoot) {
      return namespacedRoot.outerHTML;
    }

    const mainElement = doc.querySelector("main");
    return mainElement ? mainElement.outerHTML : htmlText;
  }

  function resolveAssetUrl(assetUrl, pagePath) {
    const value = String(assetUrl || "").trim();
    if (!value) return value;

    const isAbsoluteLike =
      value.startsWith("/") ||
      value.startsWith("//") ||
      /^[a-z][a-z0-9+.-]*:/i.test(value);

    if (isAbsoluteLike) {
      return value;
    }

    if (!pagePath) {
      return value;
    }

    try {
      const origin = global.location?.origin || "";
      const baseUrl = new URL(pagePath, origin);
      const resolved = new URL(value, baseUrl);
      return resolved.pathname + resolved.search + resolved.hash;
    } catch (_error) {
      return value;
    }
  }

  function extractPageAssets(htmlText, pagePath) {
    const doc = new DOMParser().parseFromString(htmlText, "text/html");
    const styles = Array.from(
      doc.querySelectorAll('link[rel="stylesheet"][href]'),
    )
      .map((node) => node.getAttribute("href"))
      .filter(Boolean)
      .map((href) => resolveAssetUrl(href, pagePath));

    const scripts = Array.from(doc.querySelectorAll("script[src]"))
      .map((node) => node.getAttribute("src"))
      .filter(Boolean)
      .map((src) => resolveAssetUrl(src, pagePath));

    return {
      styles,
      scripts,
    };
  }

  routing.routeUtils = {
    normalizeRoute,
    getRoutePath,
    extractPageContent,
    extractPageAssets,
  };
})(window);
