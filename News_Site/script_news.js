document.addEventListener('DOMContentLoaded', () => {

    const newsData = [
         {
             tag: "EVENT",
             tagClass: "tag-event",
             time: "2 hours ago",
             content: "Connect Things 3 event bringing together students and innovators to explore IoT technologies and creative ideas.",
             image: "Image_Source/news1.png"
        },
        {
              tag: "SEMINAR",
              tagClass: "tag-event",
              time: "5 hours ago",
              content: "Academic seminar on Advanced Persistent Threat with AI discussing cyber security trends and career paths.",
              image: "Image_Source/news3.jpg"
        },
        {
              tag: "ACHIEVEMENT",
              tagClass: "tag-achievement",
              time: "1 day ago",
              content: "IoTE students received recognition and certificates for their outstanding project demonstration.",
              image: "Image_Source/news4.jpg"
        },
    ];

    const tcasData = [
        {
            round: "TCAS 1",
            type: "Portfolio",
            date: "January 15, 2026",
            status: "active",
            link: "https://admission.reg.kmitl.ac.th/"
        },
        {
            round: "TCAS 2",
            type: "Quota",
            date: "March 1, 2026",
            status: "waiting",
            link: "#"
        },
        {
            round: "TCAS 3",
            type: "Admission",
            date: "May 1, 2026",
            status: "waiting",
            link: "#"
        },
        {
            round: "TCAS 4",
            type: "Direct",
            date: "June 1, 2026",
            status: "waiting",
            link: "#"
        }
    ];

    const campsData = [
        { title: "Pre IoTE Camp 4th", desc: "Big announcement for Pre IoTE Camp 4th inviting students to join a special two-day technology camp at KMITL.", image: "Image_Source/camp1.png" },
        { title: "AI Systems", desc: "Build smart devices with AI integration.", image: "Image_Source/camp2.jpg" },
        { title: "AI Cyber Camp 2025", desc: "Intensive camp exploring artificial intelligence and cybersecurity through hands-on workshops.", image: "Image_Source/camp3.jpg" },
        { title: "Road to AI Cybersecurity 2025", desc: "Training and competition program introducing AI, networking, and cybersecurity fundamentals.", image: "Image_Source/camp4.jpg" },
        { title: "Cybersecurity Training Workshop", desc: "Hands-on cybersecurity training on threat detection, incident response, and XDR security analysis.", image: "Image_Source/camp5.jpg" }
    ];

    const renderNews = () => {
        const container = document.querySelector('.news-list');
        if (container) {
            container.innerHTML = newsData.map((news, i) => `
                <article class="news-card">
                    <div class="news-card-inner">
                        <div class="news-card-thumb">
                            <img src="${news.image}" alt="news" onerror="this.src='https://via.placeholder.com/150x100'">
                        </div>
                        <div class="news-card-content">
                            <span class="news-tag ${news.tagClass}">${news.tag}</span>
                            <div class="news-time"><span>${news.time}</span></div>
                            <p class="news-excerpt">${news.content}</p>
                        </div>
                    </div>
                </article>
            `).join('');
        }
    };

    const renderAdmission = () => {
        const container = document.querySelector('.tcas-grid');
        if (container) {
            container.innerHTML = tcasData.map((tcas, i) => `
                <div class="tcas-card ${tcas.status === 'active' ? 'tcas-active' : ''}">
                    <div class="tcas-card-top">
                        <h3 class="tcas-round">${tcas.round}</h3>
                        <p class="tcas-type">${tcas.type}</p>
                    </div>
                    <div class="tcas-card-bottom">
                        <div class="tcas-date">
                            <span>${tcas.date}</span>
                        </div>
                        ${tcas.status === 'active' 
                            ? `<a href="${tcas.link}" class="tcas-apply-btn">Apply</a>` 
                            : `<span class="tcas-coming-soon">Coming soon</span>`}
                    </div>
                </div>
            `).join('');
        }
    };

    const renderCamps = () => {
        const track = document.getElementById('campsTrack');
        if (track) {
            track.innerHTML = campsData.map((camp, i) => `
                <div class="camp-card">
                    <div class="camp-card-image">
                        <img src="${camp.image}" alt="${camp.title}" onerror="this.src='https://via.placeholder.com/300x200'">
                    </div>
                    <div class="camp-card-body">
                        <h3>${camp.title}</h3>
                        <p>${camp.desc}</p>
                    </div>
                </div>
            `).join('');
        }
    };

    renderNews();
    renderAdmission();
    renderCamps();

    class FlashCardSlider {
        constructor(options) {
            this.track = document.getElementById(options.trackId);
            this.cards = this.track.querySelectorAll(options.cardSelector);
            this.dotsContainer = document.getElementById('campsDots');
            this.currentIndex = 0;
            this.init();
        }
        init() {
            this.updateCards();
            this.createDots();
            window.addEventListener('resize', () => {
                this.updateCards();
                this.createDots();
            });
            document.getElementById('campsNext').onclick = () => this.next();
            document.getElementById('campsPrev').onclick = () => this.prev();
        }
        updateCards() {
            const width = window.innerWidth;
            this.perView = width > 900 ? 3 : (width > 600 ? 2 : 1);
            const cardWidth = 100 / this.perView;
            this.cards.forEach(c => {
                c.style.minWidth = cardWidth + '%';
                c.style.maxWidth = cardWidth + '%';
            });
            this.show();
        }
        show() {
            const offset = -(this.currentIndex * (100 / this.perView));
            this.track.style.transform = `translateX(${offset}%)`;
            this.updateDots();
        }
        next() {
            if (this.currentIndex < this.cards.length - this.perView) {
                this.currentIndex++;
                this.show();
            }
        }
        prev() {
            if (this.currentIndex > 0) {
                this.currentIndex--;
                this.show();
            }
        }
        getMaxIndex() {
            return this.cards.length - this.perView;
        }
        createDots() {
            if (!this.dotsContainer) return;
            this.dotsContainer.innerHTML = '';

            const totalDots = this.getMaxIndex() + 1;
            for (let i = 0; i < totalDots; i++) {
                const dot = document.createElement('button');
                dot.classList.add('slider-dot');
                dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
                if (i === this.currentIndex) dot.classList.add('active');
                dot.addEventListener('click', () => {
                    this.goTo(i);
                });
                this.dotsContainer.appendChild(dot);
            }
        }
        updateDots() {
            if (!this.dotsContainer) return;
            const dots = this.dotsContainer.querySelectorAll('.slider-dot');
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === this.currentIndex);
            });
        }
        goTo(index) {
            this.currentIndex = index;
            this.show();
        }
        resetAutoplay() {
            // If there's autoplay functionality, reset it here
        }
    }

    new FlashCardSlider({ trackId: 'campsTrack', cardSelector: '.camp-card' });

});