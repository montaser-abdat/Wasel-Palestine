(function (global) {
  function togglePassword(button) {
    const targetId = button.getAttribute("data-target");
    if (!targetId) return;

    const input = document.getElementById(targetId);
    if (!input) return;

    const icon = button.querySelector(".material-symbols-outlined");
    const isPassword = input.type === "password";

    input.type = isPassword ? "text" : "password";
    if (icon) {
      icon.textContent = isPassword ? "visibility_off" : "visibility";
    }
    button.setAttribute(
      "aria-label",
      isPassword ? "Hide password" : "Show password",
    );
  }

  function onDocumentClick(event) {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const button = target.closest(".password-toggle");
    if (!button) return;

    event.preventDefault();
    togglePassword(button);
  }

  if (!global.__profilePasswordToggleBound) {
    document.addEventListener("click", onDocumentClick);
    global.__profilePasswordToggleBound = true;
  }
})(window);
