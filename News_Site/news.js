// ไฟล์: news.js
document.addEventListener('DOMContentLoaded', () => {

    // ---- ฟังก์ชันดึงข่าวทั้งหมดจาก Database ----
    const newsListContainer = document.querySelector('.news-list');

    async function fetchAndRenderAllNews() {
        try {
            // วิ่งไปดึงข้อมูลจาก API ของ News
            const response = await fetch('http://localhost:3000/api/News');
            const result = await response.json();

            // ถ้ามีข้อมูลส่งกลับมา ให้เอาไปสร้างการ์ด
            if (result.success && result.data.length > 0) {
                renderAllNews(result.data);
            }
        } catch (error) {
            console.error("ไม่สามารถดึงข้อมูลข่าวทั้งหมดได้:", error);
        }
    }

    function renderAllNews(newsData) {
        // 🚨 สั่งล้างไพ่! ลบข่าว Hardcode (Card 1-6) ทิ้งให้หมด
        newsListContainer.innerHTML = '';

        newsData.forEach((item, index) => {
            // เช็กลิงก์ (ตรวจสอบให้แน่ใจว่าแก้ พefUrl เป็น refUrl แล้ว!)
            const link = item.refUrl || 'javascript:void(0)'; 
            const target = item.refUrl ? 'target="_blank"' : '';
            
            // คำนวณ delay ให้ข่าวค่อยๆ เด้งขึ้นมาทีละอัน (0.05s, 0.10s, ...)
            const delay = (index * 0.05).toFixed(2);

            const newsHtml = `
                <div class="news-list-card" style="animation-delay: ${delay}s; opacity: 1; animation: fadeInUp 0.5s ease forwards;">
                    <a href="${link}" ${target} class="news-card-inner" style="text-decoration: none; color: inherit;">
                        <div class="news-card-thumb">
                            ${item.imageUrl 
                                ? `<img src="${item.imageUrl}" alt="news" style="width:100%; height:100%; object-fit:cover; border-radius:20px;">` 
                                : `<div class="thumb-placeholder"></div>`}
                        </div>
                        <div class="news-card-content">
                            <span class="news-tag tag-${item.category ? item.category.toLowerCase() : 'news'}">${item.category || 'News'}</span>
                            <div class="news-time">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                <span>${new Date(item.createdAt).toLocaleDateString('th-TH')}</span>
                            </div>
                            <p class="news-excerpt"><strong>${item.title}:</strong> ${item.description || item.excerpt || ''}</p>
                        </div>
                    </a>
                </div>
            `;
            newsListContainer.innerHTML += newsHtml;
        });
    }

    // สั่งรันฟังก์ชันทันทีที่เปิดหน้าเว็บ
    fetchAndRenderAllNews();
});