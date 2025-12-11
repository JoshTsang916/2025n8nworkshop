/**
 * Configuration
 */
const CONFIG = {
    FORM_WEBHOOK: 'https://joshtsang0916.zeabur.app/webhook/2e8707c0-2d4f-4ed9-abf3-d86c5a68f304',
    CHAT_WEBHOOK: 'https://joshtsang0916.zeabur.app/webhook/687f1da6-66f0-4450-901f-b450bb5db667/chat'
};

// =========================================================================
// 1. Circuit Board Animation (Tech Flow)
// =========================================================================
const canvas = document.getElementById('backgroundCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let circuits = [];
let nodes = [];

// Configuration for visuals
const GRID_SIZE = 40; // Spacing for grid points
const COLOR_TRACE = 'rgba(56, 189, 248, 0.05)'; // Silicon Silver/Blue (faint)
const COLOR_NODE = 'rgba(56, 189, 248, 0.3)';
const COLOR_PACKET_HEAD = '#FFB703'; // Amber
const COLOR_PACKET_TAIL = '#FF8C00'; // Orange

class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.litOpacity = 0;
        this.connections = []; // Neighbors
    }

    draw() {
        if (this.litOpacity > 0) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 183, 3, ${this.litOpacity})`; // Amber glow
            ctx.fill();

            // Glow ring
            ctx.beginPath();
            ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 183, 3, ${this.litOpacity * 0.5})`;
            ctx.stroke();

            this.litOpacity -= 0.05;
            if (this.litOpacity < 0) this.litOpacity = 0;
        } else {
            // Idle state (very faint)
            ctx.beginPath();
            ctx.arc(this.x, this.y, 1, 0, Math.PI * 2);
            ctx.fillStyle = COLOR_NODE;
            ctx.fill();
        }
    }
}

class Packet {
    constructor(path) {
        this.path = path; // Array of Nodes
        this.currentIndex = 0;
        this.progress = 0; // 0 to 1 between nodes
        this.speed = 0.15; // Speed of data flow
        this.finished = false;

        // Trigger start node
        if (this.path.length > 0) {
            this.path[0].litOpacity = 1;
        }
    }

    update() {
        this.progress += this.speed;

        if (this.progress >= 1) {
            this.progress = 0;
            this.currentIndex++;

            // Trigger next node
            if (this.currentIndex < this.path.length) {
                this.path[this.currentIndex].litOpacity = 1;
            } else {
                this.finished = true;
            }
        }
    }

    draw() {
        if (this.finished || this.currentIndex >= this.path.length - 1) return;

        const startNode = this.path[this.currentIndex];
        const endNode = this.path[this.currentIndex + 1];

        const x = startNode.x + (endNode.x - startNode.x) * this.progress;
        const y = startNode.y + (endNode.y - startNode.y) * this.progress;

        // Draw Electron/Packet
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = COLOR_PACKET_HEAD;
        ctx.shadowBlur = 10;
        ctx.shadowColor = COLOR_PACKET_TAIL;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

function initGrid() {
    nodes = [];
    circuits = [];
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    // Create Grid Nodes
    const cols = Math.ceil(width / GRID_SIZE);
    const rows = Math.ceil(height / GRID_SIZE);

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            // Add some randomness so it's not a perfect boring grid, but still aligned
            if (Math.random() > 0.6) {
                nodes.push(new Node(i * GRID_SIZE, j * GRID_SIZE));
            }
        }
    }
}

function findNeighbors() {
    // Basic implementation: find nodes horizontally or vertically aligned within distance
    // This is expensive O(N^2), but N is small (screen size / 40 ~ 500-1000 nodes)
    nodes.forEach(node => {
        node.connections = nodes.filter(other => {
            if (node === other) return false;
            const dist = Math.abs(node.x - other.x) + Math.abs(node.y - other.y);
            // Linear Horizontal or Vertical neighbor
            return (dist <= GRID_SIZE * 1.5) && (node.x === other.x || node.y === other.y);
        });
    });
}

function generateCircuit() {
    // Create a random path walker
    if (nodes.length === 0) return;

    const startNode = nodes[Math.floor(Math.random() * nodes.length)];
    let path = [startNode];
    let current = startNode;
    let steps = Math.floor(Math.random() * 10) + 5; // Path length

    for (let i = 0; i < steps; i++) {
        if (!current.connections || current.connections.length === 0) break;
        // Move towards center sometimes? No, just random neighbor
        const next = current.connections[Math.floor(Math.random() * current.connections.length)];
        path.push(next);
        current = next;
    }

    if (path.length > 2) {
        circuits.push(new Packet(path));
    }
}


function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw Static Grid Traces (Background)
    ctx.strokeStyle = COLOR_TRACE;
    ctx.lineWidth = 1;
    // We won't draw *all* connections every frame, maybe just faint dots or pre-rendered lines.
    // For performance, let's just draw nodes.

    nodes.forEach(node => node.draw());

    // Update and Draw Active Circuits
    // Spawn new packet occasionally
    if (Math.random() < 0.05) { // Spawn rate
        generateCircuit();
    }

    circuits.forEach((packet, index) => {
        packet.update();
        packet.draw();
        if (packet.finished) {
            circuits.splice(index, 1);
        }
    });

    requestAnimationFrame(animate);
}


// Event Listeners
window.addEventListener('resize', () => {
    initGrid();
    findNeighbors();
});

// Init
initGrid();
findNeighbors();
animate();


// =========================================================================
// 2. Form Submission Handling & Logic
// =========================================================================
const form = document.getElementById('registrationForm');
const submitBtn = document.getElementById('submitBtn');
const successMessage = document.getElementById('successMessage');

// New Fields
const codeInput = document.getElementById('code');
const paymentRadios = document.getElementsByName('payment_method');
const bankAccountField = document.getElementById('bankAccountField');
const bankAccountInput = document.getElementById('bank_account_last_5');

// 2.1 URL Parameter Parsing (Auto-fill Code)
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

const urlCode = getUrlParameter('code');
if (urlCode) {
    codeInput.value = urlCode;
}

// 2.2 Payment Method Logic
function handlePaymentChange() {
    let selectedMethod;
    for (const radio of paymentRadios) {
        if (radio.checked) {
            selectedMethod = radio.value;
            break;
        }
    }

    if (selectedMethod === 'bank_transfer') {
        bankAccountField.classList.remove('hidden');
        bankAccountInput.required = true;
    } else {
        bankAccountField.classList.add('hidden');
        bankAccountInput.required = false;
        bankAccountInput.value = ''; // specific cleanup
    }
}

// Add listeners to radios
for (const radio of paymentRadios) {
    radio.addEventListener('change', handlePaymentChange);
}


form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // UI Feedback: Loading
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-[#1A1A1D]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        PROCESSING DATA...
    `;

    // Construct Payload
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.timestamp = new Date().toISOString();
    data.source = 'landing-page';

    // Ensure conditional field is clean
    if (data.payment_method !== 'bank_transfer') {
        delete data.bank_account_last_5;
    }

    try {
        let response;
        if (CONFIG.FORM_WEBHOOK.includes('YOUR_FORM_WEBHOOK_URL')) {
            console.warn('Simulating form submission (No real Webhook URL set).');
            await new Promise(resolve => setTimeout(resolve, 1500));
            response = { ok: true };
        } else {
            response = await fetch(CONFIG.FORM_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }

        if (response.ok) {
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
        mode: 'window',
        target: '#n8n-chat',
        showWelcomeScreen: true,
        defaultLanguage: 'zh',
        initialMessages: [
            '嗨！我是您的工作坊小幫手。對課程有任何問題嗎？'
        ],
        i18n: {
            zh: {
                title: 'n8n 工作坊小幫手',
                subtitle: '歡迎詢問任何關於課程的問題！',
                footer: 'Powered by n8n',
                inputPlaceholder: '請輸入您的問題...',
            }
        },
        style: {
            width: '360px',
            height: '600px',
            position: 'fixed',
            right: '20px',
            bottom: '20px',
            zIndex: 9999,
            backgroundColor: '#1A1A1D', // Dark Iron Grey
            accentColor: '#FFB703', // Warm Amber
        }
    });
})();
