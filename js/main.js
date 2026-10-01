const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");
if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });
}

const form = document.getElementById("waitlistForm");
const note = document.getElementById("formNote");
if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const existing = JSON.parse(localStorage.getItem("shiftmatch-waitlist") || "[]");
    existing.push({ ...data, at: new Date().toISOString() });
    localStorage.setItem("shiftmatch-waitlist", JSON.stringify(existing));
    form.reset();
    note.hidden = false;
    note.textContent = "You’re on the list. We’ll reach out when campus access opens.";
  });
}
