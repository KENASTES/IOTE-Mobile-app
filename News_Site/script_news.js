/* ===================================================
   IoTE NEWS - Flash Card Slider & Responsive JS
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ---- Hamburger Menu ----
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            navLinks.classList.toggle('open');
        });

        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('open');
                navLinks.classList.remove('open');
            });
        });

        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                hamburger.classList.remove('open');
                navLinks.classList.remove('open');
            }
        });
    }

    // ---- Generic Slider Class ----
    class FlashCardSlider {
        constructor(options) {
            this.track = document.getElementById(options.trackId);
            this.viewport = document.getElementById(options.viewportId);
            this.prevBtn = document.getElementById(options.prevBtnId);
            this.nextBtn = document.getElementById(options.nextBtnId);
            this.dotsContainer = document.getElementById(options.dotsId);
            this.cardsPerView = options.cardsPerView || 1;
            this.autoplay = options.autoplay || false;
            this.autoplayInterval = options.autoplayInterval || 5000;

            if (!this.track || !this.viewport) return;

            this.cards = this.track.querySelectorAll(options.cardSelector);
            this.totalCards = this.cards.length;
            this.currentIndex = 0;
            this.autoplayTimer = null;
            this.isTransitioning = false;

            // Touch/swipe support
            this.touchStartX = 0;
            this.touchEndX = 0;
            this.isDragging = false;

            this.init();
        }

        init() {
            this.updateCardsPerView();
            this.createDots();
            this.bindEvents();
            this.updateSlider();

            if (this.autoplay) {
                this.startAutoplay();
            }

            // Observe for resize
            window.addEventListener('resize', () => {
                this.updateCardsPerView();
                this.createDots();
                this.updateSlider();
            });
        }

        updateCardsPerView() {
            const width = window.innerWidth;
            if (this.cardsPerView === 1) {
                // News slider: always 1 card at a time
                this.currentCardsPerView = 1;
            } else {
                // Camps slider: responsive
                if (width <= 600) {
                    this.currentCardsPerView = 1;
                } else if (width <= 900) {
                    this.currentCardsPerView = 2;
                } else {
                    this.currentCardsPerView = this.cardsPerView;
                }
            }

            // Set card widths
            const cardWidth = 100 / this.currentCardsPerView;
            this.cards.forEach(card => {
                card.style.minWidth = `${cardWidth}%`;
                card.style.maxWidth = `${cardWidth}%`;
            });

            // Adjust currentIndex if out of bounds
            const maxIndex = this.getMaxIndex();
            if (this.currentIndex > maxIndex) {
                this.currentIndex = maxIndex;
            }
        }

        getMaxIndex() {
            return Math.max(0, this.totalCards - this.currentCardsPerView);
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
                    this.resetAutoplay();
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

        updateSlider() {
            const offset = -(this.currentIndex * (100 / this.currentCardsPerView));
            this.track.style.transform = `translateX(${offset}%)`;
            this.updateDots();
            this.updateBtnStates();
        }

        updateBtnStates() {
            if (this.prevBtn) {
                this.prevBtn.style.opacity = this.currentIndex === 0 ? '0.4' : '1';
                this.prevBtn.style.pointerEvents = this.currentIndex === 0 ? 'none' : 'auto';
            }
            if (this.nextBtn) {
                const maxIndex = this.getMaxIndex();
                this.nextBtn.style.opacity = this.currentIndex >= maxIndex ? '0.4' : '1';
                this.nextBtn.style.pointerEvents = this.currentIndex >= maxIndex ? 'none' : 'auto';
            }
        }

        next() {
            if (this.isTransitioning) return;
            const maxIndex = this.getMaxIndex();
            if (this.currentIndex < maxIndex) {
                this.currentIndex++;
                this.isTransitioning = true;
                this.updateSlider();
                setTimeout(() => { this.isTransitioning = false; }, 500);
            }
        }

        prev() {
            if (this.isTransitioning) return;
            if (this.currentIndex > 0) {
                this.currentIndex--;
                this.isTransitioning = true;
                this.updateSlider();
                setTimeout(() => { this.isTransitioning = false; }, 500);
            }
        }

        goTo(index) {
            if (this.isTransitioning) return;
            const maxIndex = this.getMaxIndex();
            this.currentIndex = Math.max(0, Math.min(index, maxIndex));
            this.isTransitioning = true;
            this.updateSlider();
            setTimeout(() => { this.isTransitioning = false; }, 500);
        }

        bindEvents() {
            if (this.prevBtn) {
                this.prevBtn.addEventListener('click', () => {
                    this.prev();
                    this.resetAutoplay();
                });
            }

            if (this.nextBtn) {
                this.nextBtn.addEventListener('click', () => {
                    this.next();
                    this.resetAutoplay();
                });
            }

            // Touch events for swipe
            this.viewport.addEventListener('touchstart', (e) => {
                this.touchStartX = e.changedTouches[0].screenX;
                this.isDragging = true;
            }, { passive: true });

            this.viewport.addEventListener('touchend', (e) => {
                if (!this.isDragging) return;
                this.touchEndX = e.changedTouches[0].screenX;
                this.handleSwipe();
                this.isDragging = false;
            }, { passive: true });

            // Mouse drag support for desktop
            this.viewport.addEventListener('mousedown', (e) => {
                this.touchStartX = e.screenX;
                this.isDragging = true;
                this.viewport.style.cursor = 'grabbing';
            });

            this.viewport.addEventListener('mouseup', (e) => {
                if (!this.isDragging) return;
                this.touchEndX = e.screenX;
                this.handleSwipe();
                this.isDragging = false;
                this.viewport.style.cursor = 'grab';
            });

            this.viewport.addEventListener('mouseleave', () => {
                this.isDragging = false;
                this.viewport.style.cursor = 'grab';
            });

            // Keyboard support
            this.viewport.setAttribute('tabindex', '0');
            this.viewport.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') {
                    this.prev();
                    this.resetAutoplay();
                } else if (e.key === 'ArrowRight') {
                    this.next();
                    this.resetAutoplay();
                }
            });
        }

        handleSwipe() {
            const diff = this.touchStartX - this.touchEndX;
            const threshold = 50;

            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    this.next();
                } else {
                    this.prev();
                }
                this.resetAutoplay();
            }
        }

        startAutoplay() {
            this.autoplayTimer = setInterval(() => {
                const maxIndex = this.getMaxIndex();
                if (this.currentIndex >= maxIndex) {
                    this.currentIndex = 0;
                } else {
                    this.currentIndex++;
                }
                this.updateSlider();
            }, this.autoplayInterval);
        }

        resetAutoplay() {
            if (this.autoplay) {
                clearInterval(this.autoplayTimer);
                this.startAutoplay();
            }
        }
    }

    document.querySelectorAll('.news-slider-viewport, .camps-slider-viewport').forEach(el => {
        el.style.cursor = 'grab';
    });

    const newsListContainer = document.querySelector('.news-list');

    async function fetchAndRenderNews() {
        try {
            const response = await fetch('http://localhost:3000/api/news');
            const result = await response.json();

            if (result.success && result.data.length > 0) {
                renderNewsItems(result.data);
            }
        } catch (error) {
            console.error("ไม่สามารถดึงข้อมูลข่าวได้:", error);
        }
    }

    function renderNewsItems(newsData) {
    newsListContainer.innerHTML = '';

    newsData.forEach(item => {
        console.log("ลิงก์ของข่าวนี้คือ:", item.RefUrl);
        const link = item.RefUrl || '#'; 
        
        const newsHtml = `
            <a href="${link}" target="_blank" class="news-card" style="text-decoration: none; color: inherit; display: block;">
              <div class="news-card-inner">
                <div class="news-card-thumb">
                  ${item.imageUrl 
                    ? `<img src="${item.imageUrl}" alt="news" style="width:100%; height:100%; object-fit:cover; border-radius:20px;">` 
                    : `<div class="thumb-placeholder"></div>`}
                </div>
                <div class="news-card-content">
                  <span class="news-tag tag-${item.category.toLowerCase()}">${item.category}</span>
                  <div class="news-time">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span>${new Date(item.createdAt).toLocaleDateString('th-TH')}</span>
                  </div>
                  <p class="news-excerpt"><strong>${item.title}:</strong> ${item.excerpt}</p>
                </div>
              </div>
            </a>
        `;
        newsListContainer.innerHTML += newsHtml;
    });
}
    fetchAndRenderNews();

    async function fetchCamps() {
    try {
        const response = await fetch('http://localhost:3000/api/Camp_And_Workshop'); 
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
            renderCamps(result.data);
        }
    } catch (error) {
        console.error("Error fetching camps:", error);
    }
}

    function renderCamps(camps) {
        const campsTrack = document.getElementById('campsTrack');
        campsTrack.innerHTML = '';

        camps.forEach(camp => {
            const link = camp.RefUrl || '#'; 

            const campHtml = `
                <a href="${link}" target="_blank" class="camp-card" style="text-decoration: none; color: inherit; display: block;">
                  <div class="camp-card-image">
                    ${camp.imageUrl 
                        ? `<img src="${camp.imageUrl}" alt="${camp.title}" style="width:100%; height:200px; object-fit:cover; border-radius:20px; margin:8px; width:calc(100% - 16px);">`
                        : `<div class="camp-placeholder"></div>`}
                  </div>
                  <div class="camp-card-body">
                    <h3>${camp.title}</h3>
                    <p>${camp.description}</p>
                  </div>
                </a>
            `;
            campsTrack.innerHTML += campHtml;
        });

        const campsSlider = new FlashCardSlider({
            trackId: 'campsTrack',
            viewportId: 'campsViewport',
            prevBtnId: 'campsPrev',
            nextBtnId: 'campsNext',
            dotsId: 'campsDots',
            cardSelector: '.camp-card',
            cardsPerView: 3,
            autoplay: true,
            autoplayInterval: 7000
        });
    }

    fetchCamps();
});
