import { WatermarkEngine } from './core/watermarkEngine.js';

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const topNav = document.querySelector('.top-nav');
    const sections = document.querySelectorAll('.content-section');
    const navItems = document.querySelectorAll('.nav-item');

    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const processingArea = document.getElementById('processingArea');
    const progressBar = document.getElementById('progressBar');
    const statusTitle = document.getElementById('statusTitle');

    const singleResultView = document.getElementById('singleResultView');
    const batchResultsView = document.getElementById('batchResultsView');
    const resultsGrid = document.getElementById('resultsGrid');
    const downloadAllBtn = document.getElementById('downloadAllBtn');

    const comparisonSlider = document.getElementById('comparisonSlider');
    const imageWrapper = document.getElementById('imageWrapper');
    const originalImage = document.getElementById('originalImage');
    const cleanedImage = document.getElementById('cleanedImage');
    const sliderHandle = document.querySelector('.slider-handle');

    const detectInfo = document.getElementById('detectInfo');
    const statusInfo = document.getElementById('statusInfo');
    const downloadBtn = document.getElementById('downloadBtn');
    const resetBtn = document.getElementById('resetBtn');

    let engine = null;
    let processedQueue = [];
    let isProcessing = false;

    // Initialize Engine
    async function init() {
        try {
            updateDynamicGreeting();
            engine = await WatermarkEngine.create();
            console.log('Watermark Engine Initialized');
        } catch (error) {
            console.error('Failed to initialize engine:', error);
        }
    }

    // Dynamic Greeting Logic
    function updateDynamicGreeting() {
        const welcomeH1 = document.querySelector('.welcome-text h1');
        const welcomeP = document.querySelector('.welcome-text p');
        if (!welcomeH1 || !welcomeP) return;

        const hour = new Date().getHours();
        let timeGreeting = "Good afternoon";
        if (hour < 12) timeGreeting = "Good morning";
        else if (hour > 17) timeGreeting = "Good evening";

        welcomeP.textContent = `${timeGreeting}. Ready to restore your vision with pixel-perfect AI precision?`;
    }

    // Top Navigation & Sticky Header
    const header = document.querySelector('.top-header');

    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    if (topNav) {
        topNav.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (!navItem) return;

            const href = navItem.getAttribute('href');
            if (href && !href.startsWith('#') && href !== 'index.html') return;

            if (href === 'index.html' || href === '#home') {
                const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');

                if (isHomePage) {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }
                // If not on home page, allow default navigation
                return;
            }

            const targetId = href.startsWith('#') ? href.substring(1) : navItem.dataset.section;
            if (!targetId) return;

            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: 'smooth' });
            }

            topNav.classList.remove('active');
        });
    }

    // Scroll Reveal Intersection Observer with Staggering
    const revealElements = document.querySelectorAll('[data-reveal]');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const revealType = element.dataset.reveal;
                const delay = element.dataset.delay || 0;

                setTimeout(() => {
                    element.style.visibility = 'visible';
                    element.style.opacity = '1';

                    if (revealType === 'scale') {
                        element.style.animation = 'revealScale 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards';
                    } else if (revealType === 'fade-up') {
                        element.style.animation = 'fadeSlideUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards';
                    }
                }, delay);

                revealObserver.unobserve(element);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    revealElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.visibility = 'hidden';

        // Auto-assign stagger delay if part of a grid/list
        const parent = el.parentElement;
        if (parent && (parent.classList.contains('feature-expand-grid') ||
            parent.classList.contains('step-timeline') ||
            parent.classList.contains('usecase-grid'))) {
            const siblings = Array.from(parent.children).filter(c => c.hasAttribute('data-reveal'));
            const idx = siblings.indexOf(el);
            if (idx !== -1) {
                el.dataset.delay = idx * 150;
            }
        }

        revealObserver.observe(el);
    });


    // File Handling
    if (dropZone && fileInput) {
        dropZone.addEventListener('click', () => {
            if (isProcessing) return;
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => handleFiles(Array.from(e.target.files)));

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('drag-over');
            });
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            handleFiles(Array.from(e.dataTransfer.files));
        });
    }

    async function handleFiles(files) {
        if (files.length === 0 || isProcessing) return;

        isProcessing = true;
        processedQueue = [];
        resultsGrid.innerHTML = '';

        processingArea.classList.remove('hidden');
        processingArea.scrollIntoView({ behavior: 'smooth' });

        if (files.length === 1) {
            singleResultView.classList.remove('hidden');
            batchResultsView.classList.add('hidden');
            await processSingleFile(files[0]);
        } else {
            singleResultView.classList.add('hidden');
            batchResultsView.classList.remove('hidden');
            await processBatchFiles(files);
        }

        isProcessing = false;
    }

    async function processSingleFile(file) {
        if (!file.type.startsWith('image/')) return;

        statusTitle.textContent = "Analyzing Neural Patterns...";
        updateProgress(20);

        const img = await loadImage(file);
        originalImage.src = img.src;

        updateProgress(40);
        statusTitle.textContent = "Isolating Gemini Layers...";
        const info = engine.getWatermarkInfo(img.width, img.height);
        detectInfo.textContent = `${info.size}x${info.size} Neural Map`;

        updateProgress(70);
        statusTitle.textContent = "Synthesizing Original Pixels...";
        const resultCanvas = await engine.removeWatermarkFromImage(img);
        const blob = await new Promise(resolve => resultCanvas.toBlob(resolve, 'image/png'));
        const url = URL.createObjectURL(blob);
        cleanedImage.src = url;

        // Set backdrop blur image
        comparisonSlider.style.setProperty('--bg-image', `url(${img.src})`);

        // Use aspect-ratio based scaling to fill the viewer optimally
        imageWrapper.style.setProperty('--aspect-ratio', `${img.width} / ${img.height}`);
        imageWrapper.style.width = 'auto';

        processedQueue.push({ blob, name: file.name });

        updateProgress(100);
        statusTitle.textContent = "Restoration Complete!";
        statusInfo.textContent = "Pixel-Perfect";
        statusInfo.classList.add('success');
        updateSlider(50);
    }

    async function processBatchFiles(files) {
        statusTitle.textContent = `Batch Restoration (0/${files.length})...`;
        updateProgress(0);

        const concurrency = 3;
        let completedCount = 0;

        for (let i = 0; i < files.length; i += concurrency) {
            const chunk = files.slice(i, i + concurrency);
            await Promise.all(chunk.map(async (file) => {
                if (!file.type.startsWith('image/')) return;

                try {
                    const img = await loadImage(file);
                    const resultCanvas = await engine.removeWatermarkFromImage(img);
                    const blob = await new Promise(resolve => resultCanvas.toBlob(resolve, 'image/png'));
                    const url = URL.createObjectURL(blob);

                    processedQueue.push({ blob, name: file.name });
                    addResultCard(url, file.name, completedCount);

                    completedCount++;
                    const percent = Math.round((completedCount / files.length) * 100);
                    updateProgress(percent);
                    statusTitle.textContent = `Batch Processing (${completedCount}/${files.length})...`;
                } catch (err) {
                    console.error('Error processing file:', file.name, err);
                }
            }));
        }

        statusTitle.textContent = `Vault Update Complete! (${completedCount} Masterpieces)`;
        detectInfo.textContent = "Batch Optimized";
        statusInfo.textContent = "Mastered";
    }

    function addResultCard(url, name, index = 0) {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <img src="${url}" alt="Result">
            <div class="name">${name}</div>
            <div class="status-tag">Restored</div>
        `;
        resultsGrid.appendChild(card);
    }

    function loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    function updateProgress(percent) {
        progressBar.style.width = `${percent}%`;
    }

    // Slider Logic
    if (comparisonSlider) {
        let isResizing = false;

        // Initialize slider position for static/preview mode
        updateSlider(50);

        // Handle static image aspect ratio if not set by processSingleFile
        const stImg = document.getElementById('originalImage');
        if (stImg && stImg.complete && stImg.naturalWidth > 0) {
            // If image is already loaded (from cache), set aspect ratio
            imageWrapper.style.setProperty('--aspect-ratio', `${stImg.naturalWidth} / ${stImg.naturalHeight}`);
        } else if (stImg) {
            stImg.onload = () => {
                imageWrapper.style.setProperty('--aspect-ratio', `${stImg.naturalWidth} / ${stImg.naturalHeight}`);
            };
        }

        comparisonSlider.addEventListener('mousedown', () => isResizing = true);
        window.addEventListener('mouseup', () => isResizing = false);
        window.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            const rect = imageWrapper.getBoundingClientRect();
            const x = Math.max(0, Math.min(e.pageX - rect.left, rect.width));
            updateSlider((x / rect.width) * 100);
        });

        // Mobile touch support
        comparisonSlider.addEventListener('touchstart', () => isResizing = true);
        window.addEventListener('touchend', () => isResizing = false);
        window.addEventListener('touchmove', (e) => {
            if (!isResizing) return;
            const rect = imageWrapper.getBoundingClientRect();
            const touch = e.touches[0];
            const x = Math.max(0, Math.min(touch.pageX - rect.left, rect.width));
            updateSlider((x / rect.width) * 100);
        });
    }

    function updateSlider(percentage) {
        cleanedImage.style.clipPath = `inset(0 0 0 ${percentage}%)`;
        sliderHandle.style.left = `${percentage}%`;
    }

    // Action Buttons
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            if (processedQueue.length === 0) {
                return;
            }

            if (processedQueue.length === 1) {
                const item = processedQueue[0];

                const a = document.createElement('a');
                a.href = URL.createObjectURL(item.blob);
                a.download = `restored_${item.name}`;
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();

                // Small delay to ensure the download registers before cleanup
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(a.href);
                }, 100);
            } else {
                downloadAllAsZip();
            }
        });
    } else {
        console.error('Download Button NOT found in DOM'); // Debug
    }

    if (downloadAllBtn) {
        downloadAllBtn.addEventListener('click', downloadAllAsZip);
    }

    async function downloadAllAsZip() {
        if (processedQueue.length === 0) return;

        const zip = new JSZip();
        processedQueue.forEach(item => {
            zip.file(`restored_${item.name}`, item.blob);
        });

        const content = await zip.generateAsync({ type: 'blob' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(content);
        a.download = `gemremover_vault_${Date.now()}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            processingArea.classList.add('hidden');
            fileInput.value = '';
            updateProgress(0);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Waitlist Logic
    document.addEventListener('submit', (e) => {
        if (e.target.classList.contains('waitlist-form')) {
            e.preventDefault();
            const input = e.target.querySelector('.waitlist-input');
            const btn = e.target.querySelector('.btn.waitlist');
            if (input.value) {
                btn.textContent = "You're on the list! ✨";
                btn.style.background = "#4cd964";
                btn.style.boxShadow = "0 0 20px rgba(76, 217, 100, 0.4)";
                input.value = "";
                input.disabled = true;
            }
        }
    });

    // Magnetic Button Effect
    const magneticBtns = document.querySelectorAll('.btn.primary, .cta-glow');

    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px) scale(1.05)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = `translate(0, 0) scale(1)`;
        });
    });

    // Background Parallax Effect
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        window.addEventListener('mousemove', (e) => {
            const xPercent = (e.clientX / window.innerWidth - 0.5) * 20;
            const yPercent = (e.clientY / window.innerHeight - 0.5) * 20;

            mainContent.style.backgroundPosition = `${50 + xPercent}% ${yPercent}%`;
        });
    }

    // Start initialization
    init();

}); // End DOMContentLoaded
