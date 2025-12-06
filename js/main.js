// Inject header and footer from external files
function injectInclude(selector, file) {
    fetch(file)
        .then(response => response.text())
        .then(html => {
            document.querySelector(selector).innerHTML = html;
            setActiveNavLink(); // Re-run nav highlight after injection
        });
}

document.addEventListener('DOMContentLoaded', function() {
    // Replace header and footer containers with includes
    const header = document.querySelector('header');
    if (header) injectInclude('header', 'header.html');
    const footer = document.querySelector('footer');
    if (footer) injectInclude('footer', 'footer.html');
});

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (navLinks && hamburger && !hamburger.contains(event.target) && !navLinks.contains(event.target)) {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
});

// Smooth scroll for anchor links (fallback for older browsers)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Form submission handling for Formspree
const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        const submitBtn = this.querySelector('.btn-submit');
        if (submitBtn) {
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
        }
    });
}

// Add active class to current page nav link
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

setActiveNavLink();

// Lightbox Gallery Functionality (per-tile galleries)
const galleryImages = [
    { src: '', caption: 'Front Exterior', icon: '🏠' }
];

let currentImageIndex = 0;
let currentGallery = null; // array of {src, caption}
let lightbox = null;

// Create lightbox element (single instance)
function createLightbox() {
    if (document.querySelector('.lightbox')) return;

    const lightboxHTML = `
        <div class="lightbox" id="lightbox">
            <span class="lightbox-close" onclick="closeLightbox()">&times;</span>
            <span class="lightbox-nav lightbox-prev" onclick="prevImage()">&#10094;</span>
            <span class="lightbox-nav lightbox-next" onclick="nextImage()">&#10095;</span>
            <div class="lightbox-content">
                <img id="lightbox-img" src="" alt="" />
            </div>
            <div class="lightbox-caption">
                <p id="lightbox-caption"></p>
                <p class="lightbox-counter"><span id="lightbox-counter">1</span> / <span id="lightbox-total">1</span></p>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    lightbox = document.getElementById('lightbox');

    // keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (!lightbox) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'ArrowRight') nextImage();
    });

    // Close on background click
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) closeLightbox();
    });
}

// Open lightbox with a specific images array and start index
function openLightbox(imagesArray, startIndex = 0) {
    if (!Array.isArray(imagesArray) || imagesArray.length === 0) return;
    currentGallery = imagesArray.map(item => (typeof item === 'string') ? { src: item, caption: '' } : item);
    currentImageIndex = Math.max(0, Math.min(startIndex, currentGallery.length - 1));
    createLightbox();
    updateLightboxImage();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function nextImage() {
    if (!currentGallery) return;
    currentImageIndex = (currentImageIndex + 1) % currentGallery.length;
    updateLightboxImage();
}

function prevImage() {
    if (!currentGallery) return;
    currentImageIndex = (currentImageIndex - 1 + currentGallery.length) % currentGallery.length;
    updateLightboxImage();
}

function updateLightboxImage() {
    const images = currentGallery && currentGallery.length ? currentGallery : galleryImages;
    const image = images[currentImageIndex];
    const imgEl = document.getElementById('lightbox-img');
    const captionEl = document.getElementById('lightbox-caption');
    const counterEl = document.getElementById('lightbox-counter');
    const totalEl = document.getElementById('lightbox-total');

    if (!imgEl) return;
    imgEl.src = image.src || '';
    imgEl.alt = image.caption || '';
    captionEl.textContent = image.caption || '';
    counterEl.textContent = currentImageIndex + 1;
    totalEl.textContent = images.length;
}

// Make functions globally available
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.nextImage = nextImage;
window.prevImage = prevImage;

// --- Service tile carousel functionality ---
document.addEventListener('DOMContentLoaded', function() {
    const carousels = document.querySelectorAll('.service-carousel');

    carousels.forEach(carousel => {
        const track = carousel.querySelector('.carousel-track');
        const slides = track.querySelectorAll('img');
        const prevBtn = carousel.querySelector('.carousel-btn.prev');
        const nextBtn = carousel.querySelector('.carousel-btn.next');
        let index = 0;

        function showIndex(i) {
            index = (i + slides.length) % slides.length;
            track.style.transform = `translateX(${ -index * 100 }%)`;
        }

        prevBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            showIndex(index - 1);
        });

        nextBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            showIndex(index + 1);
        });

        // Swipe support
        let startX = 0;
        carousel.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
        }, {passive: true});

        carousel.addEventListener('touchend', function(e) {
            const endX = e.changedTouches[0].clientX;
            const diff = endX - startX;
            if (Math.abs(diff) > 40) {
                if (diff > 0) showIndex(index - 1);
                else showIndex(index + 1);
            }
        });

        // Click on image opens lightbox for this tile's gallery
        slides.forEach((img, i) => {
            img.addEventListener('click', function(e) {
                const imgs = Array.from(slides).map(s => ({ src: s.src, caption: s.alt || '' }));
                if (typeof openLightbox === 'function') openLightbox(imgs, i);
            });
        });

        // initialize: respect optional starting index set on the carousel element
        const startIndex = parseInt(carousel.getAttribute('data-index')) || 0;
        showIndex(startIndex);
    });
});
