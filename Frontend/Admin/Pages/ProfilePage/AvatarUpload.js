(function (global) {
  function applyAvatarImage(avatarCircle, image) {
    if (!avatarCircle || !image) return;

    avatarCircle.style.backgroundImage = `url(${image})`;
    avatarCircle.style.backgroundSize = "cover";
    avatarCircle.style.backgroundPosition = "center";
    avatarCircle.textContent = "";
  }

  function initProfileAvatarUpload(root) {
    const scope = root instanceof Element ? root : document;
    const uploadLink = scope.querySelector(".change-photo-link");
    const fileInput = scope.querySelector("#fileInput");
    const avatarCircle = scope.querySelector(".avatar-circle");

    const savedImage = global.localStorage?.getItem("profileImage");
    if (savedImage) {
      global.applyHeaderAvatar?.(savedImage);
      applyAvatarImage(avatarCircle, savedImage);
    }

    if (!uploadLink || !fileInput || !avatarCircle) return;

    if (fileInput.dataset.avatarUploadBound === "true") return;
    fileInput.dataset.avatarUploadBound = "true";

    uploadLink.addEventListener("click", (event) => {
      event.preventDefault();
      fileInput.click();
    });

    fileInput.addEventListener("change", (event) => {
      const file = event.target?.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const image = loadEvent.target?.result;
        if (typeof image !== "string") return;

        global.applyHeaderAvatar?.(image);
        applyAvatarImage(avatarCircle, image);
        global.localStorage?.setItem("profileImage", image);
      };

      reader.readAsDataURL(file);
    });
  }

  global.initProfileAvatarUpload = initProfileAvatarUpload;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function onReady() {
      document.removeEventListener("DOMContentLoaded", onReady);
      initProfileAvatarUpload();
    });
  } else {
    initProfileAvatarUpload();
  }
})(window);
