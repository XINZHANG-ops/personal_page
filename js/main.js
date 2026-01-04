// Main JavaScript functionality for portfolio site
// Progressive enhancement - site works without JavaScript

(function () {
    'use strict';

    // Project data structure for easy content management
    // To add new projects, simply add objects to this array following the same structure
    const projects = [
        {
            id: "mississauga-k1-speed-simulator",
            title: "Mississauga K1 Speed Simulator",
            description: "A project innovated by my team building events at Mississauga K1 Speed. Using NEAT (Genetic Algorithms on Network) to produce the best route.",
            technologies: ["Python", "Genetic Algorithms"],
            liveUrl: "https://drive.google.com/file/d/1EkHdORD-FTKhcM3DJhXJ7CHwJ0nIlEl6/view?usp=drive_link",
            githubUrl: "https://github.com/XINZHANG-ops/car-racing-simulator",
            imageUrl: "assets/images/mississauga-k1-speed-simulator.png",
            featured: true,
            size: "medium" // large, medium, small for bento grid
        },
        {
            id: "office-ai-avatar",
            title: "Office AI Avatar",
            description: "A project that build my own collegues as AI agents in office.",
            technologies: ["Python", "Langgraph", "Ollama", "TextToSpeech"],
            liveUrl: "https://www.bilibili.com/video/BV1kG4y1U7bq/?vd_source=03a8c2897d3776de4be1425beda2b267",
            githubUrl: "https://github.com/XINZHANG-ops/virtual_room",
            imageUrl: "assets/images/office-ai-avatar.png",
            featured: true,
            size: "medium"
        },
        {
            id: "cs-go-computer-vision",
            title: "CS GO Computer Vision Aim Bot",
            description: "An aim bot for local cs go gaming, not for online cheating.",
            technologies: ["Python", "YOLO"],
            liveUrl: "https://drive.google.com/file/d/1weg24oAqh_Xd066v-6Tz2GzQmDK1IgLQ/view?usp=drive_link", // put null will not show
            githubUrl: "https://github.com/XINZHANG-ops/cs-aim-bot",
            imageUrl: "assets/images/cs-go-computer-vision.png",
            featured: false,
            size: "medium"
        }
    ];

    // Writing data structure for easy content management
    // To add new writing entries, simply add objects to this array following the same structure
    const writings = [
        {
            id: "show-case-blog",
            title: "Kaiming He",
            type: "blog-post",
            venue: "Medium",
            date: "2025-05-23",
            summary: "Introduction of Kaiming He and his famouse ResNet.",
            url: "https://medium.com/@1528371521zx/kaiming-he-aa980c688eff",
            tags: ["ResNet", "Kaiming He"]
        },
        {
            id: "medium-blog-post",
            title: "My Medium Blog",
            type: "blog-post",
            venue: "Medium",
            date: "2025-03-10",
            summary: "Read more on my weekly writing on AI.",
            url: "https://medium.com/@1528371521zx",
            tags: ["AI", "AI Characters"]
        },
        {
            id: "show-case-reading",
            title: "mHC: Manifold-Constrained Hyper-Connections",
            type: "paper-reading",
            venue: "ArXiv",
            date: "2026-01-02",
            summary: "My take away for paper mHC: Manifold-Constrained Hyper-Connections.",
            url: "https://xinzhang-ops.github.io/daily_paper/dailies/pages/2026-01-02.html",
            tags: ["ResNet", "Manifold-Constrained Hyper-Connections (mHC)", "Transformer"]
        },
        {
            id: "paper-reading-github-pages",
            title: "My Daily Paper Reading",
            type: "paper-reading",
            venue: "ArXiv",
            date: "2025-03-24",
            summary: "My Daily Paper Reading and take aways.",
            url: "https://xinzhang-ops.github.io/daily_paper/index.html",
            tags: ["ML", "AI"]
        }
    ];

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function () {
        initializeNavigation();
        initializeSmoothScroll();
        initializeActiveNavigation();
        initializeTypingAnimation();
        initializeProjectsGallery();
        initializeWritingSection();
        initializeLazyLoading();
    });

    /**
     * Initialize mobile navigation toggle
     */
    function initializeNavigation() {
        const navToggle = document.querySelector('.nav__toggle');
        const navMenu = document.querySelector('.nav__menu');

        if (!navToggle || !navMenu) return;

        // Set initial ARIA state
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.setAttribute('id', 'nav-menu');

        navToggle.addEventListener('click', function () {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';

            navToggle.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('nav__menu--open');

            // Toggle hamburger animation
            navToggle.classList.toggle('nav__toggle--active');

            // Announce state change to screen readers
            const announcement = !isExpanded ? 'Navigation menu opened' : 'Navigation menu closed';
            announceToScreenReader(announcement);
        });

        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav__link');
        navLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                navToggle.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('nav__menu--open');
                navToggle.classList.remove('nav__toggle--active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navToggle.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('nav__menu--open');
                navToggle.classList.remove('nav__toggle--active');
            }
        });

        // Handle keyboard navigation
        navToggle.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navToggle.click();
            }
        });
    }

    /**
     * Announce message to screen readers
     * @param {string} message - Message to announce
     */
    function announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;

        document.body.appendChild(announcement);

        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    /**
     * Initialize smooth scroll for navigation links
     */
    function initializeSmoothScroll() {
        const navLinks = document.querySelectorAll('a[href^="#"]');

        navLinks.forEach(function (link) {
            link.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    e.preventDefault();

                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    /**
     * Initialize active navigation highlighting
     */
    function initializeActiveNavigation() {
        const navLinks = document.querySelectorAll('.nav__link');
        const sections = document.querySelectorAll('section[id]');

        if (!navLinks.length || !sections.length) return;

        function updateActiveNavigation() {
            const scrollPosition = window.scrollY + 100; // Offset for header

            sections.forEach(function (section) {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');

                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    // Remove active class from all links
                    navLinks.forEach(function (link) {
                        link.classList.remove('nav__link--active');
                    });

                    // Add active class to current section link
                    const activeLink = document.querySelector('.nav__link[href="#' + sectionId + '"]');
                    if (activeLink) {
                        activeLink.classList.add('nav__link--active');
                    }
                }
            });
        }

        // Update on scroll
        window.addEventListener('scroll', updateActiveNavigation);

        // Update on load
        updateActiveNavigation();
    }

    /**
     * Initialize typing animation for hero section
     */
    function initializeTypingAnimation() {
        const typingElement = document.querySelector('.hero__typing-words');

        if (!typingElement) return;

        const words = typingElement.getAttribute('data-words').split(',');
        let currentWordIndex = 0;
        let currentCharIndex = 0;
        let isDeleting = false;
        let typeSpeed = 150;
        let deleteSpeed = 100;
        let pauseTime = 2000;

        function typeWriter() {
            const currentWord = words[currentWordIndex];

            if (isDeleting) {
                // Deleting characters
                typingElement.textContent = currentWord.substring(0, currentCharIndex - 1);
                currentCharIndex--;

                if (currentCharIndex === 0) {
                    isDeleting = false;
                    currentWordIndex = (currentWordIndex + 1) % words.length;
                    setTimeout(typeWriter, 500); // Pause before typing next word
                    return;
                }

                setTimeout(typeWriter, deleteSpeed);
            } else {
                // Typing characters
                typingElement.textContent = currentWord.substring(0, currentCharIndex + 1);
                currentCharIndex++;

                if (currentCharIndex === currentWord.length) {
                    isDeleting = true;
                    setTimeout(typeWriter, pauseTime); // Pause at end of word
                    return;
                }

                setTimeout(typeWriter, typeSpeed);
            }
        }

        // Start the typing animation
        setTimeout(typeWriter, 1000); // Initial delay
    }

    /**
     * Initialize projects gallery with bento-grid layout
     */
    function initializeProjectsGallery() {
        const projectsGrid = document.querySelector('.projects__grid');

        if (!projectsGrid) return;

        // Clear existing content
        projectsGrid.innerHTML = '';

        // Render each project
        projects.forEach(function (project) {
            const projectCard = createProjectCard(project);
            projectsGrid.appendChild(projectCard);
        });
    }

    /**
     * Create a project card element
     * @param {Object} project - Project data object
     * @returns {HTMLElement} - Project card element
     */
    function createProjectCard(project) {
        // Create main card element
        const card = document.createElement('article');
        card.className = `project-card project-card--${project.size}`;
        card.setAttribute('data-project-id', project.id);
        card.setAttribute('role', 'listitem');
        card.setAttribute('aria-labelledby', `project-title-${project.id}`);

        // Create card content
        const cardContent = document.createElement('div');
        cardContent.className = 'project-card__content';

        // Project image
        const imageContainer = document.createElement('div');
        imageContainer.className = 'project-card__image-container';

        const image = document.createElement('img');
        image.className = 'project-card__image';
        image.setAttribute('data-src', project.imageUrl); // Use data-src for lazy loading
        image.alt = `Screenshot of ${project.title} project interface`;
        image.loading = 'lazy';

        // Add placeholder while loading
        image.style.backgroundColor = 'var(--color-secondary)';

        // Handle image loading errors with placeholder
        image.onerror = function () {
            this.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.className = 'project-card__image-placeholder';
            placeholder.innerHTML = '🚀';
            placeholder.setAttribute('role', 'img');
            placeholder.setAttribute('aria-label', `${project.title} project placeholder`);
            imageContainer.appendChild(placeholder);
        };

        imageContainer.appendChild(image);

        // Project info
        const info = document.createElement('div');
        info.className = 'project-card__info';

        // Title
        const title = document.createElement('h3');
        title.className = 'project-card__title';
        title.id = `project-title-${project.id}`;
        title.textContent = project.title;

        // Description
        const description = document.createElement('p');
        description.className = 'project-card__description';
        description.textContent = project.description;

        // Technologies
        const techContainer = document.createElement('div');
        techContainer.className = 'project-card__technologies';
        techContainer.setAttribute('role', 'list');
        techContainer.setAttribute('aria-label', 'Technologies used');

        project.technologies.forEach(function (tech) {
            const techBadge = document.createElement('span');
            techBadge.className = 'project-card__tech-badge';
            techBadge.textContent = tech;
            techBadge.setAttribute('role', 'listitem');
            techContainer.appendChild(techBadge);
        });

        // Links
        const linksContainer = document.createElement('div');
        linksContainer.className = 'project-card__links';
        linksContainer.setAttribute('role', 'group');
        linksContainer.setAttribute('aria-label', 'Project links');

        // GitHub link (always present)
        const githubLink = document.createElement('a');
        githubLink.href = project.githubUrl;
        githubLink.target = '_blank';
        githubLink.rel = 'noopener noreferrer';
        githubLink.className = 'project-card__link project-card__link--github';
        githubLink.innerHTML = '📁 Code';
        githubLink.setAttribute('aria-label', `View ${project.title} source code on GitHub (opens in new tab)`);

        linksContainer.appendChild(githubLink);

        // Live demo link (if available)
        if (project.liveUrl) {
            const liveLink = document.createElement('a');
            liveLink.href = project.liveUrl;
            liveLink.target = '_blank';
            liveLink.rel = 'noopener noreferrer';
            liveLink.className = 'project-card__link project-card__link--live';
            liveLink.innerHTML = '🚀 Demo';
            liveLink.setAttribute('aria-label', `View ${project.title} live demo (opens in new tab)`);

            linksContainer.appendChild(liveLink);
        }

        // Assemble the card
        info.appendChild(title);
        info.appendChild(description);
        info.appendChild(techContainer);
        info.appendChild(linksContainer);

        cardContent.appendChild(imageContainer);
        cardContent.appendChild(info);

        card.appendChild(cardContent);

        return card;
    }

    /**
     * Initialize writing and research section
     */
    function initializeWritingSection() {
        const writingContent = document.querySelector('.writing__content');

        if (!writingContent) return;

        // Clear existing content
        writingContent.innerHTML = '';

        // Create filter controls
        const filterContainer = document.createElement('div');
        filterContainer.className = 'writing__filters';

        const filterTitle = document.createElement('h3');
        filterTitle.className = 'writing__filters-title';
        filterTitle.textContent = 'Filter by:';

        const filterButtons = document.createElement('div');
        filterButtons.className = 'writing__filter-buttons';

        // Create filter buttons
        const filters = [
            { key: 'all', label: 'All' },
            { key: 'blog-post', label: 'Blog Posts' },
            { key: 'paper-reading', label: 'Papers Readings' }
        ];

        filters.forEach(filter => {
            const button = document.createElement('button');
            button.className = `writing__filter-btn ${filter.key === 'all' ? 'writing__filter-btn--active' : ''}`;
            button.setAttribute('data-filter', filter.key);
            button.setAttribute('aria-pressed', filter.key === 'all' ? 'true' : 'false');
            button.setAttribute('aria-label', `Filter writings by ${filter.label}`);
            button.textContent = filter.label;
            button.addEventListener('click', () => filterWritings(filter.key));
            filterButtons.appendChild(button);
        });

        filterContainer.appendChild(filterTitle);
        filterContainer.appendChild(filterButtons);

        // Create timeline container
        const timeline = document.createElement('div');
        timeline.className = 'writing__timeline';

        // Add components to writing content
        writingContent.appendChild(filterContainer);
        writingContent.appendChild(timeline);

        // Initial render - show all writings
        renderWritings('all');
    }

    /**
     * Filter writings by type
     * @param {string} filterType - Type to filter by ('all', 'blog-post', 'paper-reading', 'article')
     */
    function filterWritings(filterType) {
        // Update active filter button
        const filterButtons = document.querySelectorAll('.writing__filter-btn');
        filterButtons.forEach(btn => {
            const isActive = btn.getAttribute('data-filter') === filterType;
            btn.classList.toggle('writing__filter-btn--active', isActive);
            btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        // Render filtered writings
        renderWritings(filterType);
    }

    /**
     * Render writings based on filter
     * @param {string} filterType - Type to filter by
     */
    function renderWritings(filterType) {
        const timeline = document.querySelector('.writing__timeline');

        if (!timeline) return;

        // Clear existing content
        timeline.innerHTML = '';

        // Filter writings
        let filteredWritings = writings;
        if (filterType !== 'all') {
            filteredWritings = writings.filter(writing => writing.type === filterType);
        }

        // Sort by date (newest first)
        const sortedWritings = filteredWritings.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Render each writing entry
        sortedWritings.forEach(writing => {
            const writingCard = createWritingCard(writing);
            timeline.appendChild(writingCard);
        });

        // Show empty state if no writings
        if (sortedWritings.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'writing__empty-state';
            emptyState.innerHTML = `
                <p class="writing__empty-text">No ${filterType === 'all' ? '' : filterType.replace('-', ' ')} entries found.</p>
            `;
            timeline.appendChild(emptyState);
        }
    }

    /**
     * Create a writing card element
     * @param {Object} writing - Writing data object
     * @returns {HTMLElement} - Writing card element
     */
    function createWritingCard(writing) {
        // Create main card element
        const card = document.createElement('article');
        card.className = `writing-card writing-card--${writing.type}`;
        card.setAttribute('data-writing-id', writing.id);
        card.setAttribute('data-type', writing.type);
        card.setAttribute('role', 'listitem');
        card.setAttribute('aria-labelledby', `writing-title-${writing.id}`);

        // Create card content
        const cardContent = document.createElement('div');
        cardContent.className = 'writing-card__content';

        // Type badge
        const typeBadge = document.createElement('span');
        typeBadge.className = 'writing-card__type-badge';
        typeBadge.textContent = writing.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        typeBadge.setAttribute('aria-label', `Content type: ${typeBadge.textContent}`);

        // Title
        const title = document.createElement('h3');
        title.className = 'writing-card__title';
        title.id = `writing-title-${writing.id}`;
        title.textContent = writing.title;

        // Meta information (venue and date)
        const meta = document.createElement('div');
        meta.className = 'writing-card__meta';

        const venue = document.createElement('span');
        venue.className = 'writing-card__venue';
        venue.textContent = writing.venue;

        const dateSeparator = document.createElement('span');
        dateSeparator.className = 'writing-card__separator';
        dateSeparator.textContent = ' • ';
        dateSeparator.setAttribute('aria-hidden', 'true');

        const date = document.createElement('time');
        date.className = 'writing-card__date';
        date.setAttribute('datetime', writing.date);
        const dateObj = new Date(writing.date);
        date.textContent = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        meta.appendChild(venue);
        meta.appendChild(dateSeparator);
        meta.appendChild(date);

        // Summary
        const summary = document.createElement('p');
        summary.className = 'writing-card__summary';
        summary.textContent = writing.summary;

        // Tags
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'writing-card__tags';
        tagsContainer.setAttribute('role', 'list');
        tagsContainer.setAttribute('aria-label', 'Article tags');

        writing.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'writing-card__tag';
            tagElement.textContent = tag;
            tagElement.setAttribute('role', 'listitem');
            tagsContainer.appendChild(tagElement);
        });

        // External link
        const link = document.createElement('a');
        link.href = writing.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'writing-card__link';
        link.innerHTML = '📖 Read More';
        link.setAttribute('aria-label', `Read ${writing.title} (opens in new tab)`);

        // Assemble the card
        cardContent.appendChild(typeBadge);
        cardContent.appendChild(title);
        cardContent.appendChild(meta);
        cardContent.appendChild(summary);
        cardContent.appendChild(tagsContainer);
        cardContent.appendChild(link);

        card.appendChild(cardContent);

        return card;
    }

    /**
     * Initialize lazy loading for images
     */
    function initializeLazyLoading() {
        // Check if Intersection Observer is supported
        if (!('IntersectionObserver' in window)) {
            // Fallback: load all images immediately if not supported
            const lazyImages = document.querySelectorAll('img[loading="lazy"]');
            lazyImages.forEach(function (img) {
                img.loading = 'eager';
            });
            return;
        }

        // Create intersection observer for lazy loading
        const imageObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;

                    // If image has data-src, use it as the actual src
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }

                    // Remove loading attribute to trigger actual loading
                    img.removeAttribute('loading');

                    // Add loaded class for styling
                    img.addEventListener('load', function () {
                        img.classList.add('lazy-loaded');
                    });

                    // Stop observing this image
                    observer.unobserve(img);
                }
            });
        }, {
            // Start loading when image is 50px away from viewport
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        // Observe all lazy images
        const lazyImages = document.querySelectorAll('img[loading="lazy"], img[data-src]');
        lazyImages.forEach(function (img) {
            imageObserver.observe(img);
        });

        // Also observe dynamically added images (for project cards)
        const projectsGrid = document.querySelector('.projects__grid');
        if (projectsGrid) {
            const gridObserver = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    mutation.addedNodes.forEach(function (node) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const lazyImages = node.querySelectorAll('img[loading="lazy"], img[data-src]');
                            lazyImages.forEach(function (img) {
                                imageObserver.observe(img);
                            });
                        }
                    });
                });
            });

            gridObserver.observe(projectsGrid, {
                childList: true,
                subtree: true
            });
        }
    }

})();