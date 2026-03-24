(function (global) {
  function applyHeaderAvatar(image) {
    const profileBtn = document.getElementById("headerProfileBtn");
    if (!profileBtn) return;

    if (!profileBtn.dataset.initials) {
      profileBtn.dataset.initials = profileBtn.textContent.trim();
    }

    if (!image) {
      profileBtn.style.backgroundImage = "";
      profileBtn.style.backgroundSize = "";
      profileBtn.style.backgroundPosition = "";
      profileBtn.style.backgroundRepeat = "";
      profileBtn.textContent = profileBtn.dataset.initials;
      return;
    }

    profileBtn.style.backgroundImage = `url(${image})`;
    profileBtn.style.backgroundSize = "cover";
    profileBtn.style.backgroundPosition = "center";
    profileBtn.style.backgroundRepeat = "no-repeat";
    profileBtn.textContent = "";
  }

  global.applyHeaderAvatar = applyHeaderAvatar;

  function syncStoredHeaderAvatar() {
    const savedImage = global.localStorage?.getItem("profileImage");
    if (savedImage) {
      applyHeaderAvatar(savedImage);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function onReady() {
      document.removeEventListener("DOMContentLoaded", onReady);
      syncStoredHeaderAvatar();
    });
  } else {
    syncStoredHeaderAvatar();
  }
})(window);
