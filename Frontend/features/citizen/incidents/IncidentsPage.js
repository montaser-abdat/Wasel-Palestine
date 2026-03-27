// export function initIncidentsPage({ mainEl }) {
//   document.body.style.overflowY = "auto";

//   const detailsButtons = mainEl.querySelectorAll(".details-link");
//   const handleDetailsClick = (event) => {
//     const card = event.currentTarget.closest(".incident-card");
//     const title = card?.querySelector(".card-title")?.textContent?.trim();
//     if (title) {
//       console.info(`Selected incident: ${title}`);
//     }
//   };

//   detailsButtons.forEach((button) => {
//     button.addEventListener("click", handleDetailsClick);
//   });

//   return {
//     cleanup: () => {
//       detailsButtons.forEach((button) => {
//         button.removeEventListener("click", handleDetailsClick);
//       });
//     },
//   };
// }
