const gigs = [
  {
    id: "cafe-horizon",
    name: "Cafe Horizon",
    role: "Barista / Crew",
    pay: "₱120/hour",
    rating: "4.6",
    distance: "1.2 km",
    place: "123 Mabini St, Iloilo City",
    tags: ["Flexible Hours", "Verified"],
    about:
      "Assist in daily operations, prepare beverages, serve customers, and maintain a clean workspace.",
    requirements: ["At least 18 years old", "With or without experience", "Willing to work on weekends (optional)"],
    icon: "☕",
  },
  {
    id: "techzone",
    name: "TechZone PH",
    role: "Campus Assistant",
    pay: "₱100/hour",
    rating: "4.3",
    distance: "2.4 km",
    place: "University belt",
    tags: ["Part-time", "Verified"],
    about: "Help with campus tech support, inventory, and student-facing service windows.",
    requirements: ["Enrolled student", "Basic computer literacy"],
    icon: "💻",
  },
  {
    id: "greenmart",
    name: "GreenMart Grocery",
    role: "Sales Associate",
    pay: "₱110/hour",
    rating: "4.5",
    distance: "1.8 km",
    place: "Downtown",
    tags: ["Flexible Hours"],
    about: "Support customers on the floor, restock shelves, and cover weekend peaks.",
    requirements: ["Can stand for long periods", "Customer-friendly"],
    icon: "🛒",
  },
];

const schedule = [
  ["Mon", "8:00 AM – 12:00 PM", "Class"],
  ["Tue", "1:00 PM – 5:00 PM", "Free"],
  ["Wed", "8:00 AM – 12:00 PM", "Class"],
  ["Thu", "1:00 PM – 5:00 PM", "Free"],
  ["Fri", "8:00 AM – 12:00 PM", "Class"],
  ["Sat", "10:00 AM – 4:00 PM", "Free"],
  ["Sun", "10:00 AM – 4:00 PM", "Free"],
];

const applications = [
  { gig: "Cafe Horizon", role: "Barista / Crew", date: "Apr 25, 2025", status: "Pending" },
  { gig: "TechZone PH", role: "Campus Assistant", date: "Apr 22, 2025", status: "Pending" },
  { gig: "GreenMart Grocery", role: "Sales Associate", date: "Apr 20, 2025", status: "Accepted" },
];

let route = "welcome";
let selectedGig = gigs[0];
let filter = "Nearby";

function nav(active) {
  return `
    <nav class="nav-bar">
      ${["Home", "Gigs", "Schedule", "Profile"]
        .map(
          (item) =>
            `<button class="tab ${item === active ? "active" : ""}" data-go="${item.toLowerCase()}">${item}</button>`
        )
        .join("")}
    </nav>
  `;
}

function gigCard(gig) {
  return `
    <button class="gig" data-gig="${gig.id}">
      <div class="thumb">${gig.icon}</div>
      <div>
        <strong>${gig.name}</strong>
        <p class="muted">${gig.role} · ${gig.pay}</p>
        <div class="row">
          ${gig.tags.map((tag) => `<span class="pill ${tag === "Verified" ? "ok" : ""}">${tag}</span>`).join("")}
        </div>
      </div>
    </button>
  `;
}

const views = {
  welcome: () => `
    <section class="view welcome">
      <div class="logo-mark">SM</div>
      <h2>ShiftMatch</h2>
      <p class="sub">Flexible gig work that fits a student’s real schedule.</p>
      <button class="primary" data-go="home">Get Started</button>
      <button class="ghost" data-go="home">Log In</button>
    </section>
  `,
  home: () => `
    <section class="view">
      <div class="top">
        <div>
          <p class="muted">Hello, Christian!</p>
          <strong>Find gigs that fit your schedule.</strong>
        </div>
      </div>
      <div class="banner">
        <h3>Work Smarter, Not Harder</h3>
        <p class="muted">Schedule-friendly gigs, trusted employers.</p>
      </div>
      <p><strong>Quick Access</strong></p>
      <div class="quick">
        <button data-go="gigs">Browse Gigs</button>
        <button data-go="schedule">My Schedule</button>
        <button data-go="applications">Applications</button>
        <button data-go="profile">Profile</button>
      </div>
      <p><strong>Featured Gigs</strong></p>
      ${gigs.map(gigCard).join("")}
    </section>
    ${nav("Home")}
  `,
  gigs: () => `
    <section class="view">
      <h3>Browse Gigs</h3>
      <input class="search" placeholder="Search by job title, location, or business..." />
      <div class="filters">
        ${["Nearby", "Flexible Hours", "Highest Rating"]
          .map(
            (item) =>
              `<button class="chip ${filter === item ? "active" : ""}" data-filter="${item}">${item}</button>`
          )
          .join("")}
      </div>
      ${gigs.map(gigCard).join("")}
    </section>
    ${nav("Gigs")}
  `,
  job: () => `
    <section class="view">
      <button class="ghost" data-go="gigs">← Browse</button>
      <div class="hero-job"></div>
      <h3>${selectedGig.name}</h3>
      <p class="muted">${selectedGig.place} · ${selectedGig.distance}</p>
      <p><strong>${selectedGig.role}</strong></p>
      <p class="price">${selectedGig.pay}</p>
      <div class="row">
        ${selectedGig.tags.map((tag) => `<span class="pill">${tag}</span>`).join("")}
      </div>
      <p style="margin:14px 0 6px"><strong>About the Job</strong></p>
      <p class="muted">${selectedGig.about}</p>
      <p style="margin:14px 0 6px"><strong>Requirements</strong></p>
      ${selectedGig.requirements.map((item) => `<p>✓ ${item}</p>`).join("")}
      <p style="margin-top:14px"><button class="ghost" data-go="reviews">Employer reviews 4.6 ★</button></p>
      <button class="primary" data-go="applications">Apply Now</button>
    </section>
    ${nav("Gigs")}
  `,
  schedule: () => `
    <section class="view">
      <h3>Schedule & Conflict Alert</h3>
      <p class="muted">Your Weekly Schedule</p>
      ${schedule
        .map(
          ([day, hours, kind]) =>
            `<div class="day"><span>${day}</span><span>${hours} (${kind})</span></div>`
        )
        .join("")}
      <div class="alert">
        <strong>Schedule Conflict Detected</strong>
        <p>This shift overlaps with your class schedule on Wednesday, 8:00 AM – 12:00 PM.</p>
        <button data-go="gigs">View Alternative Shifts</button>
      </div>
    </section>
    ${nav("Schedule")}
  `,
  reviews: () => `
    <section class="view">
      <button class="ghost" data-go="job">← Job details</button>
      <h3>Employer Reviews</h3>
      <p class="stars">4.6 ★★★★★</p>
      <p class="muted">32 reviews</p>
      <p>Pay Punctuality</p><div class="bar"><span style="width:90%"></span></div>
      <p>Respect for Hours</p><div class="bar"><span style="width:88%"></span></div>
      <p>Work Environment</p><div class="bar"><span style="width:92%"></span></div>
      <div class="review"><strong>Maria S.</strong><p class="muted">Very organized and kind. Always pays on time!</p></div>
      <div class="review"><strong>James T.</strong><p class="muted">Good work environment. Managers are approachable.</p></div>
      <div class="review"><strong>Ella D.</strong><p class="muted">Flexible schedule and fair treatment for students.</p></div>
    </section>
    ${nav("Gigs")}
  `,
  applications: () => `
    <section class="view">
      <h3>My Applications</h3>
      ${applications
        .map(
          (item) => `
          <div class="gig">
            <div class="thumb">🗂️</div>
            <div>
              <strong>${item.gig}</strong>
              <p class="muted">${item.role}<br>Applied on ${item.date}</p>
              <span class="status ${item.status.toLowerCase()}">${item.status}</span>
            </div>
          </div>`
        )
        .join("")}
    </section>
    ${nav("Home")}
  `,
  profile: () => `
    <section class="view">
      <div class="profile-head">
        <div class="avatar">CP</div>
        <h3>Christian Paul</h3>
        <p class="muted">BSIT Student · WVSU</p>
        <div class="stats">
          <div><strong>3</strong><p class="muted">Applications</p></div>
          <div><strong>2</strong><p class="muted">Hired Gigs</p></div>
          <div><strong>4.6</strong><p class="muted">Avg. Rating</p></div>
        </div>
      </div>
      <div class="menu">
        <button data-go="schedule">My Schedule</button>
        <button data-go="reviews">Reviews & Ratings</button>
        <a href="index.html">Help & Support</a>
      </div>
    </section>
    ${nav("Profile")}
  `,
};

function render() {
  const screen = document.getElementById("screen");
  screen.innerHTML = views[route]();
}

document.getElementById("screen").addEventListener("click", (event) => {
  const go = event.target.closest("[data-go]");
  const gig = event.target.closest("[data-gig]");
  const chip = event.target.closest("[data-filter]");
  if (gig) {
    selectedGig = gigs.find((item) => item.id === gig.dataset.gig);
    route = "job";
    render();
    return;
  }
  if (chip) {
    filter = chip.dataset.filter;
    render();
    return;
  }
  if (go) {
    route = go.dataset.go;
    render();
  }
});

render();
