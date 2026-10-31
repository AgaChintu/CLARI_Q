// Doubt Sessions Data
const sessions = [
    {
        month: "NOV",
        day: "07",
        subject: "PROGRAMMING",
        title: "Python Programming",
        time: "11:00 AM – 12:00 PM",
        mentor: "Faculty Mentor",
        color: "blue"
    },
    {
        month: "NOV",
        day: "09",
        subject: "MATHEMATICS",
        title: "Engineering Mathematics",
        time: "02:00 PM – 03:00 PM",
        mentor: "Faculty Mentor",
        color: "pink"
    },
    {
        month: "NOV",
        day: "12",
        subject: "COMPUTER SCIENCE",
        title: "Database Management",
        time: "03:00 PM – 04:00 PM",
        mentor: "Faculty Mentor",
        color: "purple"
    }
];

// Next Session
const nextSession = document.getElementById("nextSession");

nextSession.innerHTML = `
    <div class="section-label">
        <span class="live-dot"></span>
        YOUR NEXT SESSION
    </div>

    <div class="next-content">
        <div>
            <span class="session-tag">UPCOMING</span>
            <h2>Data Structures Doubt Session</h2>
            <p>Clear your concepts and get your questions answered by an expert.</p>

            <div class="session-meta">
                <span><i data-lucide="calendar-days"></i> 05 November 2026</span>
                <span><i data-lucide="clock"></i> 04:00 PM – 05:00 PM</span>
                <span><i data-lucide="user-round"></i> Faculty Mentor</span>
            </div>
        </div>

        <div class="next-art">
            <i data-lucide="video"></i>
            <span>Live Learning</span>
        </div>
    </div>

    <button class="join-btn" type="button">
        View Session Details
        <i data-lucide="arrow-up-right"></i>
    </button>
`;

// Generate Session Cards
const container = document.getElementById("sessionsContainer");
const template = document.getElementById("sessionTemplate");

sessions.forEach((session) => {
    const card = template.content.cloneNode(true);

    card.querySelector(".session-month").textContent = session.month;
    card.querySelector(".session-day").textContent = session.day;

    const subject = card.querySelector(".subject");
    subject.textContent = session.subject;
    subject.classList.add(session.color);

    card.querySelector(".session-title").textContent = session.title;
    card.querySelector(".session-time").textContent = session.time;
    card.querySelector(".session-mentor").textContent = session.mentor;

    const dateBox = card.querySelector(".date-box");

    if (session.color === "pink") {
        dateBox.classList.add("pink-date");
    } else if (session.color === "purple") {
        dateBox.classList.add("purple-date");
    }

    card.querySelector(".details-btn").addEventListener("click", () => {
        alert(session.title + "\n" + session.time + "\n" + session.mentor);
    });

    container.appendChild(card);
});

// Update Session Count
document.getElementById("sessionCount").textContent =
    `${sessions.length.toString().padStart(2, "0")} Sessions`;

// Initialize Icons
lucide.createIcons();