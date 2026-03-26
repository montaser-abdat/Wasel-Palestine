export async function loadPageHeader(activeRoute) {
  const existingHeader = document.querySelector(".header-component");

  if (existingHeader) {
    updateActiveLink(existingHeader, activeRoute);
    return existingHeader;
  }

  const response = await fetch("/views/citizen/header/header.html");
  if (!response.ok) {
    throw new Error("Failed to load citizen header shell");
  }

  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  const header = doc.querySelector(".header-component");

  if (!header) {
    throw new Error("Citizen header markup was not found");
  }

  document.body.prepend(header);
  updateActiveLink(header, activeRoute);

  return header;
}

function updateActiveLink(header, activeRoute) {
  if (!header || !activeRoute) return;

  const links = header.querySelectorAll("[data-route]");
  links.forEach((link) => {
    const isActive = link.dataset.route === activeRoute;
    link.classList.toggle("active", isActive);
  });
}
