/**
 * Configuration
 * Replace these placeholder URLs with your actual n8n production webhook URLs.
 */
const CONFIG = {
    FORM_WEBHOOK: 'https://joshtsang0916.zeabur.app/webhook/2e8707c0-2d4f-4ed9-abf3-d86c5a68f304',
    CHAT_WEBHOOK: 'https://joshtsang0916.zeabur.app/webhook/687f1da6-66f0-4450-901f-b450bb5db667/chat'  // e.g. 
};

// =========================================================================
// 1. Canvas Background Animation (Simulating Node Connections)
// =========================================================================
const canvas = document.getElementById('backgroundCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
const particleCount = 60; // Equivalent to "Nodes"
const connectionDistance = 150; // Distance to draw lines

// Particle Class
class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5; // Slow velocity X
        this.vy = (Math.random() - 0.5) * 0.5; // Slow velocity Y
        this.size = Math.random() * 2 + 1; // Random size
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; // Main nodes
        ctx.fill();
    }
}

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initParticles();
}

function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    // Update and draw all particles
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        // Check connections
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectionDistance) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance / connectionDistance)})`;
                ctx.lineWidth = 1;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);
resize();
animate();


// =========================================================================
// 2. Form Submission Handling
// =========================================================================
const form = document.getElementById('registrationForm');
const submitBtn = document.getElementById('submitBtn');
const successMessage = document.getElementById('successMessage');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // UI Feedback: Loading
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Executing...
    `;

    // Construct Payload
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Add metadata
    data.timestamp = new Date().toISOString();
    data.source = 'landing-page';

    try {
        // If placeholder URL is still there, we simulate success for demo purposes
        let response;
        if (CONFIG.FORM_WEBHOOK.includes('YOUR_FORM_WEBHOOK_URL')) {
            console.warn('Simulating form submission (No real Webhook URL set).');
            await new Promise(resolve => setTimeout(resolve, 1500)); // Fake delay
            response = { ok: true };
        } else {
            response = await fetch(CONFIG.FORM_WEBHOOK, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
        }

        if (response.ok) {
            // Success State
            form.classList.add('hidden');
            successMessage.classList.remove('hidden');
        } else {
            throw new Error('Network response was not ok');
        }

    } catch (error) {
        console.error('Error:', error);
        alert('報名提交失敗，請檢查網路或稍後再試。');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
});


import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

// =========================================================================
// 3. n8n Chat Integration
// =========================================================================
(function () {
    createChat({
        webhookUrl: CONFIG.CHAT_WEBHOOK,
        mode: 'window', // 'window' | 'fullscreen'
        target: '#n8n-chat', // This would target a specific div if mode is embedded
        showWelcomeScreen: true,
        defaultLanguage: 'zh',
        initialMessages: [
            '嗨！我是您的工作坊小幫手。對課程有任何問題嗎？'
        ],
        style: {
            width: '360px',
            height: '600px',
            position: 'fixed',
            right: '20px',
            bottom: '20px',
            zIndex: 9999,
            backgroundColor: '#2D2D2D',
            accentColor: '#FF6D5A', // n8n Orange
        }
    });
})();
