const gigs = [
  {
    id: "cafe-horizon",
    name: "Cafe Horizon",
    role: "Barista / Crew",
    pay: "₱120/hour",
    rating: "4.6",
    distance: "1.2 km",
    place: "123 Mabini St, Iloilo City",
    tags: ["Flexible Hours"],
    category: "Coffee shop",
    businessEmail: "cafe-horizon@example.demo",
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
    tags: ["Part-time"],
    category: "Other",
    businessEmail: "techzone@example.demo",
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
    category: "Grocery",
    businessEmail: "greenmart@example.demo",
    about: "Support customers on the floor, restock shelves, and cover weekend peaks.",
    requirements: ["Can stand for long periods", "Customer-friendly"],
    icon: "🛒",
  },
];

const defaultSchedule = [
  { day: "Mon", start: 480, end: 720, course: "Class" },
  { day: "Wed", start: 480, end: 720, course: "Class" },
  { day: "Fri", start: 480, end: 720, course: "Class" },
];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const businessCategories = [
  "Coffee shop",
  "Fast food",
  "Restaurant",
  "Grocery",
  "Retail store",
  "Other",
];
let user = JSON.parse(sessionStorage.getItem("shiftmatch-user") || "null");
let route = user?.role === "business" ? "business-home" : user ? "home" : "welcome";
let selectedGig = gigs[0];
let filter = "Nearby";
let formMessage = "";
let selectedStudentEmail = "";
let gigSearch = "";
let gigCategory = "All categories";
let schedule = JSON.parse(localStorage.getItem("shiftmatch-schedule") || "null") || defaultSchedule;
let postedGigs = JSON.parse(localStorage.getItem("shiftmatch-business-gigs") || "[]");
let applications = JSON.parse(localStorage.getItem("shiftmatch-applications") || "[]");
let businessVerifications = JSON.parse(localStorage.getItem("shiftmatch-business-verifications") || "{}");
let studentPortfolios = JSON.parse(localStorage.getItem("shiftmatch-student-portfolios") || "{}");

function currentUser() {
  return user || { name: "Christian Paul", email: "student@wvsu.edu.ph", role: "student" };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return entities[character];
  });
}

function allGigs() {
  return [...postedGigs].reverse().concat(gigs);
}

function studentApplications() {
  return applications.filter((application) => application.studentEmail === currentUser().email.toLowerCase());
}

function businessApplications() {
  return applications.filter((application) => application.businessEmail === currentUser().email.toLowerCase());
}

function businessOpenShifts() {
  return postedGigs.filter((gig) => gig.businessEmail === currentUser().email.toLowerCase());
}

function mapUrl(place) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;
}

function locationCard(gig) {
  const place = gig.place || "Location not provided";
  return `
    <article class="location-card">
      <div class="location-pin" aria-hidden="true">⌖</div>
      <div class="location-copy">
        <strong>${escapeHtml(gig.name)}</strong>
        <p class="muted">${escapeHtml(gig.category || "Business")} · ${escapeHtml(place)}</p>
        <p class="muted">${escapeHtml(gig.role)} · ${escapeHtml(gig.pay)}</p>
        <a class="map-link" href="${mapUrl(place)}" target="_blank" rel="noopener noreferrer">View on map ↗</a>
      </div>
    </article>
  `;
}

function verificationStatus(email) {
  return businessVerifications[email?.toLowerCase()]?.status || "unverified";
}

function verificationLabel(status) {
  return {
    verified: "Verified",
    pending: "Documents under review",
    "needs-updates": "Documents need updates",
    unverified: "Not verified",
  }[status] || "Not verified";
}

function verificationPill(email) {
  const status = verificationStatus(email);
  return `<span class="pill verification-${status}">${verificationLabel(status)}</span>`;
}

function businessCategoryOptions(selected = "") {
  return businessCategories
    .map((category) => `<option value="${escapeHtml(category)}" ${category === selected ? "selected" : ""}>${escapeHtml(category)}</option>`)
    .join("");
}

function portfolioForCurrentStudent() {
  const email = currentUser().email.toLowerCase();
  return studentPortfolios[email] || {
    name: currentUser().name,
    email: currentUser().email,
    school: "",
    program: "",
    skills: "",
    experience: "",
    bio: "",
    public: false,
  };
}

function sharedPortfolios() {
  return Object.values(studentPortfolios).filter((portfolio) => portfolio.public);
}

function businessGigCards() {
  const ownGigs = postedGigs.filter((gig) => gig.businessEmail === currentUser().email.toLowerCase());
  if (!ownGigs.length) return `<p class="muted">You haven’t posted any shifts yet.</p>`;
  return ownGigs
    .map(
      (gig) =>
        `<article class="business-gig"><strong>${escapeHtml(gig.role)}</strong><p class="muted">${escapeHtml(gig.pay)} · ${escapeHtml(gig.place)}</p><div class="row"><span class="pill">${escapeHtml(gig.category || "Other")}</span>${verificationPill(gig.businessEmail)}<span class="pill ok">Open</span></div></article>`
    )
    .join("");
}

function documentSubmission() {
  return businessVerifications[currentUser().email.toLowerCase()];
}

function businessVerificationSection() {
  const submission = documentSubmission();
  const documents = [
    ["registration", "DTI, SEC, or CDA business registration"],
    ["permit", "Current mayor’s or business permit"],
    ["representativeId", "Authorized representative’s government ID"],
  ];
  return `
    <section class="verification-card">
      <h3>Business verification</h3>
      <p class="muted">Submit these documents so the ShiftMatch team can review the business. A submission does not mean the business is verified.</p>
      <div class="verification-summary"><strong>Status</strong>${verificationPill(currentUser().email)}</div>
      ${submission?.submittedAt ? `<p class="file-help">Submitted ${new Date(submission.submittedAt).toLocaleDateString()} · Awaiting platform review.</p>` : ""}
      ${submission?.reviewNote ? `<p class="form-message">${escapeHtml(submission.reviewNote)}</p>` : ""}
      <form class="documents-form" data-documents-form>
        ${documents.map(([key, label]) => `
          <label>${label}
            <input type="file" name="${key}" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" required />
            ${submission?.documents?.[key] ? `<span class="file-help">Previously submitted: ${escapeHtml(submission.documents[key])}</span>` : ""}
          </label>
        `).join("")}
        <p class="file-help">PDF, PNG, or JPG · maximum 5 MB per document. Demo uploads save filenames and review status in this browser only; files are not sent to a server.</p>
        ${formMessage ? `<p class="form-message" role="alert">${escapeHtml(formMessage)}</p>` : ""}
        <button class="primary" type="submit">Submit documents for review</button>
      </form>
    </section>
  `;
}

function studentPortfolioList() {
  const profiles = sharedPortfolios();
  if (!profiles.length) {
    return `<div class="empty-state"><strong>No shared portfolios yet</strong><p class="muted">Students who opt in to portfolio sharing will appear here.</p></div>`;
  }
  return profiles.map((portfolio) => `
    <button class="portfolio-card" data-student-email="${escapeHtml(portfolio.email)}">
      <span class="avatar small-avatar">${escapeHtml((portfolio.name || "S").split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase())}</span>
      <span><strong>${escapeHtml(portfolio.name)}</strong><span class="muted portfolio-subtitle">${escapeHtml(portfolio.program || "Student")} · ${escapeHtml(portfolio.school || "School not listed")}</span><span class="muted portfolio-subtitle">${escapeHtml(portfolio.skills || "Skills not added yet")}</span></span>
      <span class="portfolio-arrow">View →</span>
    </button>
  `).join("");
}

function studentPortfolioDetail() {
  const portfolio = studentPortfolios[selectedStudentEmail];
  if (!portfolio?.public) {
    return `<section class="view"><button class="ghost" data-go="business-students">← Portfolios</button><p class="empty-state">This portfolio is no longer shared.</p></section>`;
  }
  return `
    <section class="view">
      <button class="ghost" data-go="business-students">← Portfolios</button>
      <div class="profile-head">
        <div class="avatar">${escapeHtml((portfolio.name || "S").split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase())}</div>
        <h3>${escapeHtml(portfolio.name)}</h3>
        <p class="muted">${escapeHtml(portfolio.program || "Program not listed")} · ${escapeHtml(portfolio.school || "School not listed")}</p>
      </div>
      <article class="portfolio-section"><h3>About</h3><p>${escapeHtml(portfolio.bio || "No introduction added yet.")}</p></article>
      <article class="portfolio-section"><h3>Skills</h3><p>${escapeHtml(portfolio.skills || "No skills listed yet.")}</p></article>
      <article class="portfolio-section"><h3>Experience</h3><p>${escapeHtml(portfolio.experience || "No experience listed yet.")}</p></article>
      <p class="muted portfolio-contact">Contact: ${escapeHtml(portfolio.email)}</p>
    </section>
  `;
}

function timeLabel(minutes) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

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
  const distance = Number.parseFloat(gig.distance);
  const flexible = (gig.tags || []).some((tag) => tag.toLowerCase() === "flexible hours");
  return `
    <button class="gig" data-gig="${escapeHtml(gig.id)}" data-category="${escapeHtml(gig.category || "")}" data-distance="${Number.isFinite(distance) ? distance : ""}" data-rating="${Number(gig.rating) || 0}" data-flexible="${flexible}" aria-label="${escapeHtml(`${gig.name}, ${gig.role}, ${gig.pay}`)}">
      <div class="thumb">${gig.icon || "💼"}</div>
      <div>
        <strong>${escapeHtml(gig.name)}</strong>
        <p class="muted">${escapeHtml(gig.role)} · ${escapeHtml(gig.pay)}</p>
        <div class="row">
          ${gig.category ? `<span class="pill">${escapeHtml(gig.category)}</span>` : ""}
          ${(gig.tags || ["Flexible Hours"])
            .map((tag) => `<span class="pill ${tag === "Verified" ? "ok" : ""}">${escapeHtml(tag)}</span>`)
            .join("")}
          ${verificationPill(gig.businessEmail)}
        </div>
      </div>
    </button>
  `;
}

function loginView(role, signup = false) {
  const business = role === "business";
  const roleLabel = business ? "Business" : "Student";
  const nameLabel = business ? "Business name" : "Full name";
  return `
    <section class="view welcome auth-view">
      <button class="ghost back-button" data-go="welcome">← Choose account type</button>
      <div class="logo-mark">SM</div>
      <h2>${signup ? "Create your account" : `${roleLabel} log in`}</h2>
      <p class="sub">${business ? "Post flexible shifts and find student talent." : "Find flexible work that fits around your classes."}</p>
      <form class="auth-form" data-auth-form data-role="${role}" data-signup="${signup}">
        ${signup ? `<label>${nameLabel}<input name="name" autocomplete="name" required placeholder="${nameLabel}" /></label>` : ""}
        <label>Email<input name="email" type="email" autocomplete="email" required placeholder="${business ? "you@business.com" : "you@school.edu"}" /></label>
        <label>Password<input name="password" type="password" autocomplete="${signup ? "new-password" : "current-password"}" required minlength="6" placeholder="At least 6 characters" /></label>
        ${formMessage ? `<p class="form-message" role="alert">${escapeHtml(formMessage)}</p>` : ""}
        <button class="primary" type="submit">${signup ? "Create demo account" : "Log in"}</button>
      </form>
      <p class="demo-note">Demo only: accounts are not verified, and passwords are not saved.</p>
      <button class="ghost" data-go="${role}-${signup ? "login" : "signup"}">${signup ? "Already have an account? Log in" : "New to ShiftMatch? Create an account"}</button>
    </section>
  `;
}

function scheduleRows() {
  return days
    .map((day) => {
      const events = schedule
        .filter((item) => item.day === day)
        .sort((a, b) => a.start - b.start);
      const rows = [];
      let cursor = 8 * 60;
      for (const event of events) {
        if (event.start > cursor) {
          rows.push(`<div class="day free-time"><span>${day} · Free</span><span>${timeLabel(cursor)} – ${timeLabel(event.start)}</span></div>`);
        }
        rows.push(`<div class="day class-time"><span>${day} · Class</span><span>${timeLabel(event.start)} – ${timeLabel(event.end)}${event.course ? ` · ${escapeHtml(event.course)}` : ""}</span></div>`);
        cursor = Math.max(cursor, event.end);
      }
      if (cursor < 22 * 60) {
        rows.push(`<div class="day free-time"><span>${day} · Free</span><span>${timeLabel(cursor)} – ${timeLabel(22 * 60)}</span></div>`);
      }
      return rows.join("");
    })
    .join("");
}

function studentApplicationCards() {
  const ownApplications = studentApplications();
  if (!ownApplications.length) {
    return `<div class="empty-state"><strong>No applications yet</strong><p class="muted">Apply for a shift and track its status here.</p></div>`;
  }
  return ownApplications.map((application) => `
    <article class="application-card">
      <div class="application-card-head"><strong>${escapeHtml(application.role)}</strong><span class="status ${application.status.toLowerCase()}">${escapeHtml(application.status)}</span></div>
      <p>${escapeHtml(application.businessName)} · ${escapeHtml(application.pay)}</p>
      <p class="muted">${escapeHtml(application.place)} · Applied ${new Date(application.appliedAt).toLocaleDateString()}</p>
      <a class="map-link" href="${mapUrl(application.place)}" target="_blank" rel="noopener noreferrer">View business location ↗</a>
    </article>
  `).join("");
}

function businessApplicantCards() {
  const ownApplications = businessApplications();
  if (!ownApplications.length) {
    return `<div class="empty-state"><strong>No applicants yet</strong><p class="muted">When students apply to your shifts, you can review and respond here.</p></div>`;
  }
  return ownApplications.map((application) => {
    const portfolio = studentPortfolios[application.studentEmail];
    return `
      <article class="applicant-card">
        <div class="application-card-head"><strong>${escapeHtml(application.studentName)}</strong><span class="status ${application.status.toLowerCase()}">${escapeHtml(application.status)}</span></div>
        <p>Applied for <strong>${escapeHtml(application.role)}</strong></p>
        <p class="muted">${escapeHtml(application.studentEmail)} · ${escapeHtml(application.school || "School not listed")}</p>
        <p class="muted">Applied ${new Date(application.appliedAt).toLocaleDateString()}</p>
        ${portfolio?.public ? `<button class="text-action" data-student-email="${escapeHtml(application.studentEmail)}">View shared portfolio</button>` : `<p class="file-help">This student has not shared a portfolio.</p>`}
        ${application.status === "Pending" ? `
          <div class="applicant-actions">
            <button class="accept-action" data-application-id="${escapeHtml(application.id)}" data-app-status="Accepted">Accept</button>
            <button class="decline-action" data-application-id="${escapeHtml(application.id)}" data-app-status="Declined">Decline</button>
          </div>
        ` : ""}
      </article>
    `;
  }).join("");
}

const views = {
  welcome: () => `
    <section class="view welcome">
      <div class="logo-mark">SM</div>
      <h2>ShiftMatch</h2>
      <p class="sub">Sign in to find flexible work or connect with student talent.</p>
      <button class="primary" data-go="student-login">Continue as a student</button>
      <button class="secondary-action" data-go="business-login">Continue as a business</button>
      <p class="demo-note">Interactive demo · no password is stored or verified</p>
    </section>
  `,
  "student-login": () => loginView("student"),
  "student-signup": () => loginView("student", true),
  "business-login": () => loginView("business"),
  "business-signup": () => loginView("business", true),
  home: () => `
    <section class="view">
      <div class="top">
        <div>
          <p class="muted">Hello, ${escapeHtml(currentUser().name || "Student")}!</p>
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
        <button data-go="portfolio">Portfolio</button>
        <button data-go="locations">Business locations</button>
      </div>
      <p><strong>Featured Gigs</strong></p>
      ${allGigs().slice(0, 3).map(gigCard).join("")}
    </section>
    ${nav("Home")}
  `,
  gigs: () => `
    <section class="view">
      <h3>Browse Gigs</h3>
      <input class="search" value="${escapeHtml(gigSearch)}" placeholder="Search by job title, location, or business..." />
      <label class="category-select">Business type<select class="category-filter"><option ${gigCategory === "All categories" ? "selected" : ""}>All categories</option>${businessCategoryOptions(gigCategory)}</select></label>
      <div class="filters">
        ${["Nearby", "Flexible Hours", "Highest Rating"]
          .map(
            (item) =>
              `<button class="chip ${filter === item ? "active" : ""}" data-filter="${item}" aria-pressed="${filter === item}">${item}</button>`
          )
          .join("")}
      </div>
      <p class="filter-note">Nearby sorts by distance from campus. Highest Rating sorts by employer rating.</p>
      <div class="gig-list">${allGigs().map(gigCard).join("")}</div>
      <p class="empty-state gig-empty" hidden>No shifts match these filters yet.</p>
    </section>
    ${nav("Gigs")}
  `,
  job: () => `
    <section class="view">
      <button class="ghost" data-go="gigs">← Browse</button>
      <div class="hero-job"></div>
      <h3>${escapeHtml(selectedGig.name)}</h3>
      <p class="muted">${escapeHtml(selectedGig.place || "Iloilo City")} · ${escapeHtml(selectedGig.distance || "Flexible")}</p>
      <a class="map-link detail-map-link" href="${mapUrl(selectedGig.place || "Iloilo City")}" target="_blank" rel="noopener noreferrer">View business location on map ↗</a>
      <p><strong>${escapeHtml(selectedGig.role)}</strong></p>
      <p class="price">${escapeHtml(selectedGig.pay)}</p>
      <div class="row">${selectedGig.category ? `<span class="pill">${escapeHtml(selectedGig.category)}</span>` : ""}${(selectedGig.tags || []).map((tag) => `<span class="pill">${escapeHtml(tag)}</span>`).join("")}${selectedGig.businessEmail ? verificationPill(selectedGig.businessEmail) : ""}</div>
      ${selectedGig.businessEmail ? `<p class="file-help">Business verification: ${escapeHtml(verificationLabel(verificationStatus(selectedGig.businessEmail)))}. Check the status before applying.</p>` : ""}
      <p style="margin:14px 0 6px"><strong>About the Job</strong></p>
      <p class="muted">${escapeHtml(selectedGig.about || "Flexible work with a student-friendly employer.")}</p>
      <p style="margin:14px 0 6px"><strong>Requirements</strong></p>
      ${(selectedGig.requirements || []).map((item) => `<p>✓ ${escapeHtml(item)}</p>`).join("")}
      <p style="margin-top:14px"><button class="ghost" data-go="reviews">Employer reviews 4.6 ★</button></p>
      ${formMessage ? `<p class="form-message" role="status">${escapeHtml(formMessage)}</p>` : ""}
      <button class="primary" data-apply="${escapeHtml(selectedGig.id)}">Apply Now</button>
    </section>
    ${nav("Gigs")}
  `,
  schedule: () => `
    <section class="view">
      <h3>My Weekly Schedule</h3>
      <p class="muted">Upload a .csv or .ics class timetable. ShiftMatch will build your class blocks and free time.</p>
      <form class="upload-form" data-schedule-form>
        <label>Class schedule file<input type="file" name="schedule" accept=".csv,.ics,text/csv,text/calendar" required /></label>
        <p class="file-help">CSV columns: day, start, end, course (for example: Monday, 8:00 AM, 10:00 AM, Biology). ICS calendar files are also supported.</p>
        ${formMessage ? `<p class="form-message" role="alert">${escapeHtml(formMessage)}</p>` : ""}
        <button class="primary" type="submit">Upload & create schedule</button>
      </form>
      <div class="schedule-list">${scheduleRows()}</div>
      <p class="schedule-caption">Free-time blocks are calculated between 8:00 AM and 10:00 PM.</p>
      <div class="alert">
        <strong>Schedule-aware matching</strong>
        <p>Use your generated free-time blocks to find shifts that fit around class.</p>
        <button data-go="gigs">Browse Gigs</button>
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
      <p class="muted">Track the status of each shift you applied for.</p>
      ${formMessage ? `<p class="success-message" role="status">${escapeHtml(formMessage)}</p>` : ""}
      ${studentApplicationCards()}
    </section>
    ${nav("Home")}
  `,
  locations: () => `
    <section class="view">
      <button class="ghost" data-go="home">← Student dashboard</button>
      <h3>Business locations</h3>
      <p class="muted">Check the address and open a map before applying or planning your trip.</p>
      ${allGigs().map(locationCard).join("")}
    </section>
    ${nav("Home")}
  `,
  profile: () => `
    <section class="view">
      <div class="profile-head">
        <div class="avatar">${escapeHtml((currentUser().name || "CP").split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase())}</div>
        <h3>${escapeHtml(currentUser().name || "Student")}</h3>
        <p class="muted">${escapeHtml(currentUser().email)}</p>
        <div class="stats">
          <div><strong>3</strong><p class="muted">Applications</p></div>
          <div><strong>2</strong><p class="muted">Hired Gigs</p></div>
          <div><strong>4.6</strong><p class="muted">Avg. Rating</p></div>
        </div>
      </div>
      <div class="menu">
        <button data-go="schedule">My Schedule</button>
        <button data-go="portfolio">Worker Portfolio</button>
        <button data-go="reviews">Reviews & Ratings</button>
        <button data-go="logout">Log out</button>
      </div>
    </section>
    ${nav("Profile")}
  `,
  portfolio: () => {
    const portfolio = portfolioForCurrentStudent();
    return `
      <section class="view">
        <h3>My worker portfolio</h3>
        <p class="muted">Add details businesses can use to find a good fit. Your portfolio is private until you choose to share it.</p>
        <form class="portfolio-form" data-portfolio-form>
          <label>School<input name="school" required maxlength="100" value="${escapeHtml(portfolio.school)}" placeholder="College or university" /></label>
          <label>Program or course<input name="program" required maxlength="100" value="${escapeHtml(portfolio.program)}" placeholder="e.g. BS Information Technology" /></label>
          <label>Skills<input name="skills" maxlength="300" value="${escapeHtml(portfolio.skills)}" placeholder="e.g. Customer service, POS, food prep" /></label>
          <label>Work or volunteer experience<textarea name="experience" rows="3" maxlength="800" placeholder="Relevant work, projects, or volunteer experience">${escapeHtml(portfolio.experience)}</textarea></label>
          <label>About me<textarea name="bio" rows="3" maxlength="800" placeholder="A short introduction">${escapeHtml(portfolio.bio)}</textarea></label>
          <label class="share-toggle"><input type="checkbox" name="public" ${portfolio.public ? "checked" : ""} /> Share my portfolio with businesses</label>
          ${formMessage ? `<p class="form-message" role="alert">${escapeHtml(formMessage)}</p>` : ""}
          <button class="primary" type="submit">Save portfolio</button>
        </form>
        <button class="ghost" data-go="profile">Back to profile</button>
      </section>
      ${nav("Profile")}
    `;
  },
  "business-home": () => `
    <section class="view">
      <div class="top"><div><p class="muted">Business dashboard</p><strong>${escapeHtml(currentUser().name || "Your business")}</strong></div><button class="dashboard-signout" data-go="logout">Log out</button></div>
      <div class="banner">
        <h3>Welcome back</h3>
        <p class="muted">Manage shifts, review applicants, and find student talent.</p>
      </div>
      ${businessVerificationSection()}
      <div class="business-metrics">
        <article><strong>${businessOpenShifts().length}</strong><span>Open shifts</span></article>
        <article><strong>${businessApplications().filter((application) => application.status === "Pending").length}</strong><span>New applicants</span></article>
        <article><strong>${sharedPortfolios().length}</strong><span>Shared portfolios</span></article>
      </div>
      <div class="dashboard-actions">
        <button class="dashboard-action" data-go="business-post"><span>＋</span><strong>Post a shift</strong><small>Create an opening</small></button>
        <button class="dashboard-action" data-go="business-applicants"><span>♧</span><strong>Applicants</strong><small>Review and respond</small></button>
        <button class="dashboard-action" data-go="business-students"><span>▣</span><strong>Student portfolios</strong><small>Find student talent</small></button>
      </div>
      <div class="section-heading"><h3>Your open shifts</h3><button class="text-action" data-go="business-post">Post new</button></div>
      ${businessGigCards()}
      <button class="ghost" data-go="logout">Log out</button>
    </section>
  `,
  "business-post": () => `
    <section class="view">
      <button class="ghost" data-go="business-home">← Business dashboard</button>
      <h3>Post a shift</h3>
      <p class="muted">Add a clear address so students can check the location before applying.</p>
      <form class="business-form" data-business-form>
        <label>Role<input name="role" required placeholder="e.g. Barista" /></label>
        <label>Hourly pay<input name="pay" required placeholder="e.g. ₱120/hour" /></label>
        <label>Business address<input name="place" required placeholder="Street, neighborhood, city" /></label>
        <label>Distance from campus (km)<input name="distance" type="number" min="0" max="1000" step="0.1" required placeholder="e.g. 1.5" /></label>
        <label>Business type<select name="category" required><option value="">Choose a category</option>${businessCategoryOptions()}</select></label>
        <label>Shift flexibility<select name="flexibility" required><option value="flexible">Flexible hours</option><option value="fixed">Fixed shift</option></select></label>
        <label>Shift details<textarea name="about" rows="3" maxlength="800" placeholder="Hours, responsibilities, and what students should know"></textarea></label>
        ${formMessage ? `<p class="form-message" role="alert">${escapeHtml(formMessage)}</p>` : ""}
        <button class="primary" type="submit">Publish shift</button>
      </form>
    </section>
  `,
  "business-applicants": () => `
    <section class="view">
      <button class="ghost" data-go="business-home">← Business dashboard</button>
      <h3>Applicants</h3>
      <p class="muted">Review students who applied to your shifts and update their status.</p>
      ${businessApplicantCards()}
    </section>
  `,
  "business-students": () => `
    <section class="view">
      <button class="ghost" data-go="business-home">← Business dashboard</button>
      <h3>Student portfolios</h3>
      <p class="muted">Only students who opted in to portfolio sharing are listed.</p>
      <div class="portfolio-list">${studentPortfolioList()}</div>
    </section>
  `,
  "business-portfolio": () => studentPortfolioDetail(),
};

function render() {
  const screen = document.getElementById("screen");
  if (!screen) return;
  screen.innerHTML = (views[route] || views.welcome)();
  if (route === "gigs") applyGigFilters();
}

function parseTime(value) {
  const text = value.trim();
  const match = text.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!match) throw new Error(`Invalid time: "${text}". Use a time like 8:30 AM or 13:30.`);
  let hour = Number(match[1]);
  const minute = Number(match[2] || 0);
  const suffix = match[3]?.toUpperCase();
  if (minute > 59 || hour > 23 || (suffix && (hour < 1 || hour > 12))) {
    throw new Error(`Invalid time: "${text}".`);
  }
  if (suffix) hour = (hour % 12) + (suffix === "PM" ? 12 : 0);
  return hour * 60 + minute;
}

function normalizeDay(value) {
  const day = value.trim().toLowerCase().slice(0, 3);
  const match = days.find((item) => item.toLowerCase() === day);
  if (!match) throw new Error(`Unknown day: "${value}". Use Monday through Sunday.`);
  return match;
}

function parseCsv(text) {
  const rows = text.split(/\r?\n/).filter((line) => line.trim()).map((line) => {
    const cells = [];
    let cell = "";
    let quoted = false;
    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      if (char === '"' && line[index + 1] === '"' && quoted) {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = !quoted;
      } else if (char === "," && !quoted) {
        cells.push(cell.trim());
        cell = "";
      } else {
        cell += char;
      }
    }
    if (quoted) throw new Error("The CSV file contains an unclosed quote.");
    cells.push(cell.trim());
    return cells;
  });
  if (!rows.length) throw new Error("The CSV file is empty.");
  const header = rows[0].map((value) => value.toLowerCase());
  const hasHeader = header.includes("day") && header.includes("start") && header.includes("end");
  const columns = hasHeader
    ? { day: header.indexOf("day"), start: header.indexOf("start"), end: header.indexOf("end"), course: header.indexOf("course") }
    : { day: 0, start: 1, end: 2, course: 3 };
  const data = hasHeader ? rows.slice(1) : rows;
  return data.map((row) => ({
    day: normalizeDay(row[columns.day] || ""),
    start: parseTime(row[columns.start] || ""),
    end: parseTime(row[columns.end] || ""),
    course: row[columns.course] || "Class",
  }));
}

function parseIcs(text) {
  const normalized = text.replace(/\r?\n[ \t]/g, "");
  const blocks = normalized.split(/BEGIN:VEVENT/i).slice(1);
  const events = [];
  for (const block of blocks) {
    const lines = block.split(/END:VEVENT/i)[0].split(/\r?\n/);
    const property = (name) => lines.find((line) => new RegExp(`^${name}(;[^:]*)?:`, "i").test(line));
    const startLine = property("DTSTART");
    const endLine = property("DTEND");
    if (!startLine || !endLine) continue;
    const startValue = startLine.slice(startLine.indexOf(":") + 1);
    const endValue = endLine.slice(endLine.indexOf(":") + 1);
    const startMatch = startValue.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/);
    const endMatch = endValue.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/);
    if (!startMatch || !endMatch) continue;
    const weekdayIndex = new Date(Date.UTC(Number(startMatch[1]), Number(startMatch[2]) - 1, Number(startMatch[3]))).getUTCDay();
    const day = days[(weekdayIndex + 6) % 7];
    const start = Number(startMatch[4]) * 60 + Number(startMatch[5]);
    let end = Number(endMatch[4]) * 60 + Number(endMatch[5]);
    if (end <= start && startMatch.slice(1, 4).join("") !== endMatch.slice(1, 4).join("")) end += 24 * 60;
    const summary = lines.find((line) => /^SUMMARY:/i.test(line));
    events.push({ day, start, end, course: summary ? summary.slice(summary.indexOf(":") + 1) : "Class" });
  }
  if (!events.length) throw new Error("No timed class events were found in that calendar file.");
  return events;
}

function validateSchedule(events) {
  if (!events.length) throw new Error("The file has no schedule rows.");
  for (const event of events) {
    if (event.start < 0 || event.start >= 24 * 60 || event.end <= event.start || event.end > 24 * 60) {
      throw new Error(`Check the class time for ${event.day}: the end must be after the start and within the same day.`);
    }
  }
  for (const day of days) {
    const sameDay = events.filter((event) => event.day === day).sort((a, b) => a.start - b.start);
    for (let index = 1; index < sameDay.length; index += 1) {
      if (sameDay[index].start < sameDay[index - 1].end) {
        throw new Error(`Two classes overlap on ${day}. Check the uploaded schedule and try again.`);
      }
    }
  }
  return events;
}

document.getElementById("screen").addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const go = target.closest("[data-go]");
  const gig = target.closest("[data-gig]");
  const chip = target.closest("[data-filter]");
  const apply = target.closest("[data-apply]");
  const applicationAction = target.closest("[data-app-status]");
  const student = target.closest("[data-student-email]");
  if (student) {
    selectedStudentEmail = student.dataset.studentEmail.toLowerCase();
    route = "business-portfolio";
    render();
    return;
  }
  if (gig) {
    selectedGig = allGigs().find((item) => item.id === gig.dataset.gig) || gigs[0];
    route = "job";
    render();
    return;
  }
  if (apply) {
    if (!user || user.role !== "student") {
      formMessage = "Log in as a student to apply for this shift.";
      route = "student-login";
      render();
      return;
    }
    const gigToApply = allGigs().find((item) => item.id === apply.dataset.apply);
    if (!gigToApply) return;
    const studentEmail = user.email.toLowerCase();
    const duplicate = applications.some(
      (application) => application.gigId === gigToApply.id && application.studentEmail === studentEmail
    );
    if (duplicate) {
      formMessage = "You have already applied for this shift.";
      render();
      return;
    }
    const portfolio = studentPortfolios[studentEmail];
    applications.push({
      id: `application-${Date.now()}`,
      gigId: gigToApply.id,
      businessName: gigToApply.name,
      businessEmail: gigToApply.businessEmail?.toLowerCase() || "",
      role: gigToApply.role,
      pay: gigToApply.pay,
      place: gigToApply.place,
      studentName: user.name,
      studentEmail,
      school: portfolio?.school || "",
      status: "Pending",
      appliedAt: new Date().toISOString(),
    });
    localStorage.setItem("shiftmatch-applications", JSON.stringify(applications));
    formMessage = "Your application was sent. Track its status in My Applications.";
    route = "applications";
    render();
    return;
  }
  if (applicationAction) {
    const application = applications.find(
      (item) => item.id === applicationAction.dataset.applicationId &&
        item.businessEmail === currentUser().email.toLowerCase()
    );
    if (!application || application.status !== "Pending") return;
    application.status = applicationAction.dataset.appStatus;
    localStorage.setItem("shiftmatch-applications", JSON.stringify(applications));
    render();
    return;
  }
  if (chip) {
    filter = chip.dataset.filter;
    render();
    return;
  }
  if (go) {
    formMessage = "";
    if (go.dataset.go === "logout") {
      sessionStorage.removeItem("shiftmatch-user");
      user = null;
      route = "welcome";
    } else {
      route = go.dataset.go;
    }
    render();
  }
});

document.getElementById("screen").addEventListener("input", (event) => {
  const target = event.target;
  if (target instanceof HTMLInputElement && target.matches(".search")) {
    gigSearch = target.value.trim().toLowerCase();
    applyGigFilters();
  }
});

document.getElementById("screen").addEventListener("change", (event) => {
  const target = event.target;
  if (target instanceof HTMLSelectElement && target.matches(".category-filter")) {
    gigCategory = target.value;
    applyGigFilters();
  }
});

function applyGigFilters() {
  const list = document.querySelector(".gig-list");
  const cards = [...document.querySelectorAll(".gig-list .gig[data-gig]")];
  const distanceOf = (card) => {
    const distance = Number.parseFloat(card.dataset.distance);
    return Number.isFinite(distance) ? distance : Number.POSITIVE_INFINITY;
  };
  cards.sort((first, second) => {
    if (filter === "Highest Rating") {
      return Number(second.dataset.rating) - Number(first.dataset.rating) ||
        distanceOf(first) - distanceOf(second);
    }
    return distanceOf(first) - distanceOf(second);
  });
  for (const card of cards) {
    if (list) list.append(card);
    const matchesSearch = card.textContent.toLowerCase().includes(gigSearch);
    const matchesCategory = gigCategory === "All categories" || card.dataset.category === gigCategory;
    const matchesFlexibility = filter !== "Flexible Hours" || card.dataset.flexible === "true";
    card.hidden = !matchesSearch || !matchesCategory || !matchesFlexibility;
  }
  const empty = document.querySelector(".gig-empty");
  if (empty) empty.hidden = cards.some((card) => !card.hidden);
}

document.getElementById("screen").addEventListener("submit", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLFormElement)) return;
  event.preventDefault();
  formMessage = "";
  const data = new FormData(target);
  if (target.matches("[data-auth-form]")) {
    user = {
      name: String(data.get("name") || data.get("email") || "").split("@")[0].trim(),
      email: String(data.get("email")).trim().toLowerCase(),
      role: target.dataset.role,
    };
    sessionStorage.setItem("shiftmatch-user", JSON.stringify(user));
    route = user.role === "business" ? "business-home" : "home";
    render();
    return;
  }
  if (target.matches("[data-schedule-form]")) {
    const file = data.get("schedule");
    if (!(file instanceof File) || !file.size) {
      formMessage = "Choose a .csv or .ics schedule file first.";
      render();
      return;
    }
    if (!/\.(csv|ics)$/i.test(file.name)) {
      formMessage = "Upload a .csv or .ics schedule file.";
      render();
      return;
    }
    try {
      const text = await file.text();
      const imported = file.name.toLowerCase().endsWith(".ics") ? parseIcs(text) : parseCsv(text);
      schedule = validateSchedule(imported).sort((a, b) => days.indexOf(a.day) - days.indexOf(b.day) || a.start - b.start);
      localStorage.setItem("shiftmatch-schedule", JSON.stringify(schedule));
    } catch (error) {
      formMessage = error instanceof Error ? error.message : "Could not read this schedule file.";
    }
    render();
    return;
  }
  if (target.matches("[data-documents-form]")) {
    const documents = [
      ["registration", "business registration"],
      ["permit", "business permit"],
      ["representativeId", "authorized representative ID"],
    ];
    const submittedDocuments = {};
    for (const [key, label] of documents) {
      const file = data.get(key);
      if (!(file instanceof File) || !file.size) {
        formMessage = `Upload the ${label} to continue.`;
        render();
        return;
      }
      if (!/\.(pdf|png|jpe?g)$/i.test(file.name)) {
        formMessage = `The ${label} must be a PDF, PNG, or JPG file.`;
        render();
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        formMessage = `The ${label} exceeds the 5 MB file limit.`;
        render();
        return;
      }
      submittedDocuments[key] = file.name;
    }
    const email = currentUser().email.toLowerCase();
    businessVerifications[email] = {
      businessName: currentUser().name,
      status: "pending",
      documents: submittedDocuments,
      submittedAt: new Date().toISOString(),
    };
    localStorage.setItem("shiftmatch-business-verifications", JSON.stringify(businessVerifications));
    render();
    return;
  }
  if (target.matches("[data-portfolio-form]")) {
    const email = currentUser().email.toLowerCase();
    studentPortfolios[email] = {
      name: currentUser().name,
      email: currentUser().email,
      school: String(data.get("school")).trim(),
      program: String(data.get("program")).trim(),
      skills: String(data.get("skills") || "").trim(),
      experience: String(data.get("experience") || "").trim(),
      bio: String(data.get("bio") || "").trim(),
      public: data.get("public") === "on",
    };
    localStorage.setItem("shiftmatch-student-portfolios", JSON.stringify(studentPortfolios));
    route = "profile";
    render();
    return;
  }
  if (target.matches("[data-business-form]")) {
    postedGigs.push({
      id: `business-${Date.now()}`,
      name: currentUser().name,
      businessEmail: currentUser().email.toLowerCase(),
      role: String(data.get("role")),
      pay: String(data.get("pay")),
      place: String(data.get("place")),
      distance: `${Number(data.get("distance"))} km`,
      category: String(data.get("category")),
      icon: "💼",
      tags: data.get("flexibility") === "flexible" ? ["Flexible Hours"] : ["Fixed Shift"],
      about: String(data.get("about") || "A student-friendly shift posted by a local business.").trim(),
      requirements: ["Reliable and motivated"],
    });
    localStorage.setItem("shiftmatch-business-gigs", JSON.stringify(postedGigs));
    route = "business-home";
    render();
  }
});

render();
