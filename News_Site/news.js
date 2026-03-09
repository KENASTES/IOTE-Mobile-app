/* ===================================================
   IoTE NEWS - Static Mockup (Same Path / No API)
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // 1. ข้อมูล Mockup สำหรับข่าวสาร (News)
 const newsData = [
    {
        title: "Connect Things 3",
        category: "EVENT",
        time: "2 hours ago",
        description: "Connect Things 3 event bringing together students and innovators to explore IoT technologies and creative ideas.",
        image: "Image_Source/news1.png",
        link: "#"
    },
    {
        title: "APT with AI Cyber Security Seminar",
        category: "SEMINAR",
        time: "5 hours ago",
        description: "Academic seminar on Advanced Persistent Threat with AI discussing cyber security trends and career paths.",
        image: "Image_Source/news3.jpg",
        link: "#"
    },
    {
        title: "Student Project Achievement",
        category: "ACHIEVEMENT",
        time: "1 day ago",
        description: "IoTE students received recognition and certificates for their outstanding project demonstration.",
        image: "Image_Source/news4.jpg",
        link: "#"
    },
    {
        title: "TCAS1 Portfolio 2569 Admission",
        category: "ADMISSION",
        time: "1 day ago",
        description: "TCAS1 Portfolio 2569 admission is now open for students interested in IoT and Information Engineering.",
        image: "Image_Source/news5.jpg",
        link: "#"
    },
    {
        title: "IoTE Department Collaboration Event",
        category: "ACTIVITY",
        time: "2 days ago",
        description: "Department of IoT and Information Engineering hosts a special academic collaboration and partnership event.",
        image: "Image_Source/news6.jpg",
        link: "#"
    }
];

    // 2. ข้อมูล Mockup สำหรับ Admission (TCAS)
    const tcasData = [
        { round: "TCAS 1", type: "Portfolio", date: "January 15, 2026", status: "active", link: "https://admission.reg.kmitl.ac.th/" },
        { round: "TCAS 2", type: "Quota", date: "March 1, 2026", status: "waiting", link: "#" },
        { round: "TCAS 3", type: "Admission", date: "May 1, 2026", status: "waiting", link: "#" },
        { round: "TCAS 4", type: "Direct", date: "June 1, 2026", status: "waiting", link: "#" }
    ];

    // 3. ข้อมูล Mockup สำหรับ Camps
    const campsData = [
        { title: "IoT Bootcamp", desc: "Learn to build smart devices from scratch.", image: "Image_Source/camp1.jpg" },
        { title: "AI Systems", desc: "Build smart devices with AI integration.", image: "Image_Source/camp2.jpg" },
        { title: "Robotics Workshop", desc: "Design and program autonomous robots.", image: "Image_Source/camp3.jpg" }
    ];

    // --- ฟังก์ชัน Render ข่าว ---
    function renderNews() {
        const container = document.querySelector('.news-list');
        if (!container) return;

        container.innerHTML = newsData.map((item, index) => `
            <article class="news-card" id="news-card-${index}">
                <div class="news-card-inner">
                    <div class="news-card-thumb">
                        <img src="${item.image}" alt="news" onerror="this.src='https://via.placeholder.com/150x100?text=News'">
                    </div>
                    <div class="news-card-content">
                        <span class="news-tag tag-${item.category.toLowerCase()}">${item.category}</span>
                        <div class="news-time">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span>${item.time}</span>
                        </div>
                        <p class="news-excerpt">
                            <strong>${item.title}:</strong> ${item.description}
                        </p>
                    </div>
                </div>
            </article>
        `).join('');
    }

    // --- ฟังก์ชัน Render รับสมัคร (Admission) ---
    function renderAdmission() {
        const container = document.querySelector('.tcas-grid');
        if (!container) return;

        container.innerHTML = tcasData.map(tcas => `
            <div class="tcas-card ${tcas.status === 'active' ? 'tcas-active' : ''}">
                <div class="tcas-card-top">
                    <h3 class="tcas-round">${tcas.round}</h3>
                    <p class="tcas-type">${tcas.type}</p>
                </div>
                <div class="tcas-card-bottom">
                    <div class="tcas-date">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>${tcas.date}</span>
                    </div>
                    ${tcas.status === 'active' 
                        ? `<a href="${tcas.link}" target="_blank" class="tcas-apply-btn">Apply</a>` 
                        : `<span class="tcas-coming-soon">Coming soon</span>`}
                </div>
            </div>
        `).join('');
    }

    // --- ฟังก์ชัน Render ค่าย (Camps) ---
    function renderCamps() {
        const track = document.getElementById('campsTrack');
        if (!track) return;

        track.innerHTML = campsData.map(camp => `
            <div class="camp-card">
                <div class="camp-card-image">
                    <img src="${camp.image}" alt="${camp.title}" onerror="this.src='https://via.placeholder.com/300x200?text=Camp'">
                </div>
                <div class="camp-card-body">
                    <h3>${camp.title}</h3>
                    <p>${camp.desc}</p>
                </div>
            </div>
        `).join('');
    }

    // --- Slider Logic สำหรับส่วนค่าย ---
    function initSlider() {
        const track = document.getElementById('campsTrack');
        if (!track) return;
        
        let currentIndex = 0;
        const nextBtn = document.getElementById('campsNext');
        const prevBtn = document.getElementById('campsPrev');

        const updateSlider = () => {
            const width = window.innerWidth;
            const perView = width > 900 ? 3 : (width > 600 ? 2 : 1);
            const cardWidth = 100 / perView;
            
            const cards = track.querySelectorAll('.camp-card');
            cards.forEach(c => {
                c.style.minWidth = cardWidth + '%';
                c.style.maxWidth = cardWidth + '%';
            });

            track.style.transform = `translateX(-${currentIndex * cardWidth}%)`;
        };

        nextBtn?.addEventListener('click', () => {
            const cards = track.querySelectorAll('.camp-card');
            const perView = window.innerWidth > 900 ? 3 : (window.innerWidth > 600 ? 2 : 1);
            if (currentIndex < cards.length - perView) {
                currentIndex++;
                updateSlider();
            }
        });

        prevBtn?.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateSlider();
            }
        });

        window.addEventListener('resize', updateSlider);
        updateSlider();
    }

    // --- เริ่มทำงาน ---
    renderNews();
    renderAdmission();
    renderCamps();
    initSlider();

});