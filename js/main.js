// Inject header and footer from external files
function injectInclude(selector, file) {
    fetch(file)
        .then(response => response.text())
        .then(html => {
            document.querySelector(selector).innerHTML = html;
            setActiveNavLink(); // Re-run nav highlight after injection
            // Ensure header interactions are initialized for injected content
            if (typeof initHeaderInteractions === 'function') initHeaderInteractions();
        });
}

document.addEventListener('DOMContentLoaded', function() {
    // Replace header and footer containers with includes
    const header = document.querySelector('header');
    if (header) injectInclude('header', 'header.html');
    const footer = document.querySelector('footer');
    if (footer) injectInclude('footer', 'footer.html');
});

// Initialize header interactions (hamburger toggle, link close, outside click)
function initHeaderInteractions() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    // Attach toggle to hamburger (idempotent)
    if (hamburger && hamburger.dataset.headerInit !== 'true') {
        hamburger.addEventListener('click', function() {
            const nav = document.querySelector('.nav-links');
            if (!nav) return;
            const isActive = nav.classList.toggle('active');
            this.classList.toggle('active');
            if (!isActive) {
                // menu closed -> collapse any open dropdowns
                document.querySelectorAll('.nav-links li.has-dropdown.open').forEach(function(li) { li.classList.remove('open'); });
            }
        });
        hamburger.dataset.headerInit = 'true';
    }

    // Helper to close nav and collapse dropdowns
    function closeNav() {
        const nav = document.querySelector('.nav-links');
        const hb = document.querySelector('.hamburger');
        if (nav) nav.classList.remove('active');
        if (hb) hb.classList.remove('active');
        document.querySelectorAll('.nav-links li.has-dropdown.open').forEach(function(li) { li.classList.remove('open'); });
    }

    // Close menu when clicking a link (idempotent)
    if (navLinks && navLinks.dataset.linksInit !== 'true') {
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function(e) {
                // If this link is the parent 'Services' link and we're on small screen,
                // let the dropdown toggle handler handle it (avoid navigating away immediately).
                const parentLi = this.closest('li.has-dropdown');
                if (parentLi && window.innerWidth <= 768) {
                    // If it's a child link (inside dropdown), proceed to close nav
                    if (this.closest('.dropdown')) {
                        closeNav();
                        return;
                    }
                    // If it's the top-level parent anchor, ignore here — the dropdown handler manages it
                    e.preventDefault();
                    return;
                }

                closeNav();
            });
        });
        navLinks.dataset.linksInit = 'true';
    }

    // Close menu when clicking outside - attach once globally
    if (!window._headerOutsideClickInitialized) {
        document.addEventListener('click', function(event) {
            const hb = document.querySelector('.hamburger');
            const nav = document.querySelector('.nav-links');
            if (nav && hb && !hb.contains(event.target) && !nav.contains(event.target)) {
                nav.classList.remove('active');
                hb.classList.remove('active');
                // collapse dropdowns when closing
                document.querySelectorAll('.nav-links li.has-dropdown.open').forEach(function(li) { li.classList.remove('open'); });
            }
        });
        window._headerOutsideClickInitialized = true;
    }

    // Dropdown toggle behavior on small screens: clicking the parent anchor toggles .open
    if (navLinks && navLinks.dataset.dropdownInit !== 'true') {
        document.querySelectorAll('.nav-links li.has-dropdown').forEach(function(li) {
            // find the immediate anchor inside the li
            var trigger = li.querySelector('a');
            if (!trigger) return;
            trigger.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    // prevent navigation on small screens and toggle the submenu
                    e.preventDefault();
                    li.classList.toggle('open');
                }
            });
        });
        navLinks.dataset.dropdownInit = 'true';
    }
}

document.addEventListener('DOMContentLoaded', initHeaderInteractions);

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

// Handle tab opening from hash on services page
function openTabFromHash() {
    const hash = window.location.hash;
    if (!hash) return;
    
    // Map hash to tab IDs
    const hashToTab = {
        '#new-builds': 'tab-new-builds',
        '#full-home': 'tab-full-home',
        '#kitchens': 'tab-kitchens',
        '#bathrooms': 'tab-bathrooms'
    };
    
    const tabId = hashToTab[hash];
    if (tabId) {
        // Wait for DOM to be ready and tabs to be initialized
        setTimeout(() => {
            const tabButton = document.getElementById(tabId);
            if (tabButton) {
                tabButton.click();
                // Scroll to the tabs section smoothly
                const tabsSection = document.querySelector('.service-tabs');
                if (tabsSection) {
                    setTimeout(() => {
                        const header = document.querySelector('header');
                        const headerOffset = header ? (header.offsetHeight + 12) : 80;
                        const top = window.scrollY + tabsSection.getBoundingClientRect().top - headerOffset;
                        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
                    }, 100);
                }
            }
        }, 300);
    }
}

// Run on page load
if (window.location.pathname.includes('services.html')) {
    document.addEventListener('DOMContentLoaded', openTabFromHash);
    // Also handle hash changes (if user clicks back/forward)
    window.addEventListener('hashchange', openTabFromHash);
}

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
let _prevFocus = null;

// Create lightbox element (single instance)
function createLightbox() {
    if (document.querySelector('.lightbox')) return;

    const lightboxHTML = `
        <div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-hidden="true">
            <button class="lightbox-close" aria-label="Close" onclick="closeLightbox()">&times;</button>
            <button class="lightbox-nav lightbox-prev" aria-label="Previous image" onclick="prevImage()">&#10094;</button>
            <button class="lightbox-nav lightbox-next" aria-label="Next image" onclick="nextImage()">&#10095;</button>
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

    // Close when clicking outside the image (but not on controls such as prev/next/close)
    lightbox.addEventListener('click', function(e) {
        // If the click occurred inside the main image/content area or on controls, ignore
        if (e.target.closest('.lightbox-content') || e.target.closest('.lightbox-nav') || e.target.closest('.lightbox-close')) return;
        // otherwise, treat as background click
        closeLightbox();
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
    lightbox.setAttribute('aria-hidden', 'false');
    // store previously focused element so we can return focus on close
    _prevFocus = document.activeElement;
    // move keyboard focus to the close button for screen readers
    const closeBtn = lightbox.querySelector('.lightbox-close');
    if (closeBtn) closeBtn.focus();
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    if (lightbox) {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        // return focus
        try { if (_prevFocus && typeof _prevFocus.focus === 'function') _prevFocus.focus(); } catch (e) {}
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
function initServiceCarousels() {
    const carousels = document.querySelectorAll('.service-carousel');

    carousels.forEach(carousel => {
        // avoid double-init
        if (carousel.dataset.carouselInitialized === 'true') return;
        const track = carousel.querySelector('.carousel-track');
        if (!track) return;
        const slides = track.querySelectorAll('img');
        const prevBtn = carousel.querySelector('.carousel-btn.prev');
        const nextBtn = carousel.querySelector('.carousel-btn.next');
        let index = 0;

        function showIndex(i) {
            index = (i + slides.length) % slides.length;
            track.style.transform = `translateX(${ -index * 100 }%)`;
        }

        if (prevBtn) prevBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            showIndex(index - 1);
        });

        if (nextBtn) nextBtn.addEventListener('click', function(e) {
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
                e.stopPropagation();
                const imgs = Array.from(slides).map(s => ({ src: s.src, caption: s.getAttribute('data-caption') || s.alt || '' }));
                if (typeof openLightbox === 'function') openLightbox(imgs, i);
            });
        });

        // initialize: respect optional starting index set on the carousel element
        const startIndex = parseInt(carousel.getAttribute('data-index')) || 0;
        showIndex(startIndex);

        carousel.dataset.carouselInitialized = 'true';
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initServiceCarousels();
});

// Accordion behavior for Services page
function initServiceAccordion() {
    const accordion = document.getElementById('servicesAccordion');
    if (!accordion) return;

    const headers = accordion.querySelectorAll('.accordion-header');
    headers.forEach(header => {
        header.addEventListener('click', function() {
            const expanded = this.getAttribute('aria-expanded') === 'true';
            const panelId = this.getAttribute('aria-controls');
            const panel = document.getElementById(panelId);
            if (!panel) return;

            if (expanded) {
                this.setAttribute('aria-expanded', 'false');
                panel.classList.remove('open');
            } else {
                // close any other open panels (optional: single-open behavior)
                accordion.querySelectorAll('.accordion-header[aria-expanded="true"]').forEach(h => {
                    h.setAttribute('aria-expanded', 'false');
                    const pid = h.getAttribute('aria-controls');
                    const p = document.getElementById(pid);
                    if (p) p.classList.remove('open');
                });

                this.setAttribute('aria-expanded', 'true');
                panel.classList.add('open');
                // initialize any carousels inside the opened panel
                if (typeof initServiceCarousels === 'function') initServiceCarousels();
            }
        });

        // keyboard support
        header.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });

    // Open panel if URL hash matches
    const hash = window.location.hash.replace('#','');
    if (hash) {
        const targetHeader = document.querySelector('#' + CSS.escape(hash) + ' .accordion-header') || document.getElementById(hash + '-header');
        if (targetHeader) targetHeader.click();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initServiceAccordion();
});

// Homepage scroll effects: fade hero and pull up about section
document.addEventListener('DOMContentLoaded', function() {
    if (!document.body.classList.contains('home')) return;

    const SCROLL_THRESHOLD = 40; // px scrolled before effect
    let ticking = false;

    function onScroll() {
        if (ticking) return;
        window.requestAnimationFrame(() => {
            const scrolled = window.scrollY > SCROLL_THRESHOLD;
            document.body.classList.toggle('scrolled', scrolled);
            ticking = false;
        });
        ticking = true;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    // Run once to set initial state (in case page was opened scrolled)
    onScroll();
});

// Open shared lightbox for all carousels within a section (by id)
function openGalleryForSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    // collect images from all service-carousels inside the section
    const imgs = Array.from(section.querySelectorAll('.service-carousel .carousel-track img'))
        .map(img => ({ src: img.src, caption: img.getAttribute('data-caption') || img.alt || '' }));
    if (imgs.length && typeof openLightbox === 'function') openLightbox(imgs, 0);
}

window.openGalleryForSection = openGalleryForSection;

// If any code tried to open a pending lightbox before this script loaded, open it now
if (window._pendingLightbox && typeof openLightbox === 'function') {
    openLightbox(window._pendingLightbox.imgs, window._pendingLightbox.index || 0);
    window._pendingLightbox = null;
}
