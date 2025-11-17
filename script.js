// Smooth scroll function
function scrollToJoin() {
    const ctaSection = document.getElementById('join');
    ctaSection.scrollIntoView({ behavior: 'smooth' });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Join button click handler
document.querySelectorAll('.join-btn, .join-btn-large').forEach(button => {
    button.addEventListener('click', function() {
        window.open('https://forms.gle/hxAzPmh6VgDJ5RUg8', '_blank');
    });
});

// Add scroll animation to elements
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'slideUp 0.6s ease-out forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all feature items and about cards
document.querySelectorAll('.feature-item, .about-card').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
});

// Navigation bar background on scroll
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(10, 14, 39, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 102, 255, 0.2)';
    } else {
        navbar.style.backgroundColor = 'rgba(10, 14, 39, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Add hover effects to cards
document.querySelectorAll('.about-card, .feature-item').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = this.classList.contains('about-card') 
            ? 'translateY(-10px) scale(1.02)' 
            : 'translateX(5px) scale(1.01)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) translateX(0) scale(1)';
    });
});

console.log('🚀 Welcome to Target Y - Student Community for Techies!');

// Mobile navigation toggle
document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.createElement('button');
    toggle.className = 'mobile-toggle';
    toggle.innerText = 'Menu';
    const navContainer = document.querySelector('.nav-container');
    if (navContainer) navContainer.appendChild(toggle);

    const navMenu = document.querySelector('.nav-menu');
    toggle.addEventListener('click', function() {
        if (!navMenu) return;
        navMenu.classList.toggle('mobile-active');
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-menu a').forEach(a => {
        a.addEventListener('click', () => {
            if (navMenu) navMenu.classList.remove('mobile-active');
        });
    });
});
