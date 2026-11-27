// ===== Menu fisso =====
const menu = document.querySelector(".menu");
const voci = menu.querySelectorAll(".voci a");

// 1. lo sfondo compare appena si scorre
function controllaScorrimento() {
  menu.classList.toggle("scorso", window.scrollY > 20);
}
window.addEventListener("scroll", controllaScorrimento);
controllaScorrimento();

// 2. evidenzia la sezione che si trova a metà schermo
const guarda = new IntersectionObserver((elementi) => {
  elementi.forEach((elemento) => {
    if (elemento.isIntersecting) {
      // a.hash è la parte del link dopo "#": vale sia per "#blog" sia per "../index.html#blog" (pagine dei blog)
      voci.forEach((a) => a.classList.toggle("attiva", a.hash === "#" + elemento.target.id));
    }
  });
}, { rootMargin: "-50% 0px -50% 0px" });
document.querySelectorAll("section").forEach((s) => guarda.observe(s));
