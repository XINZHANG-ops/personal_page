// Beer scoring data and functionality
(function () {
    'use strict';

    // Beer data structure
    // This file is AUTO-GENERATED from data/beer.jsonl
    // To add new beers, use: python add_beer.py
    // Then rebuild with: npm run build-beer
    const beers = [
    {
        "id": "wellington-helles-lager",
        "name": "Wellington Helles Lager",
        "style": "Lager",
        "abv": 4.5,
        "date": "2026-01-07",
        "price": 3.65,
        "imageUrl": "../assets/images/beers/wellington-helles-lager.jpg",
        "notes": "I don't really like this flavor. When I first drink it, there's an ale-like taste that I don't enjoy. Although a malty aroma comes through after a while, it isn't very strong.",
        "scores": {
            "maltiness": 3,
            "colorDepth": 3,
            "clarity": 9.5,
            "bitterness": 6.5,
            "otherAromas": 5,
            "overall": 4
        }
    },
    {
        "id": "carlsberg-lite",
        "name": "Carlsberg Lite",
        "style": "Lager",
        "abv": 4,
        "date": "2026-01-07",
        "price": 3.05,
        "imageUrl": "../assets/images/beers/carlsberg-lite.jpg",
        "notes": "It's not a flavor I like either. On the first sip, there's a burnt or scorched taste. To be precise, it doesn't really feel like a lager, and there's almost no malt flavor at all.",
        "scores": {
            "maltiness": 2,
            "colorDepth": 3.5,
            "clarity": 9.5,
            "bitterness": 5.5,
            "otherAromas": 7.5,
            "overall": 3
        }
    },
    {
        "id": "grolsch-premium-pilsner",
        "name": "Grolsch Premium Pilsner",
        "style": "Pilsner",
        "abv": 5,
        "date": "2026-01-07",
        "price": 2.75,
        "imageUrl": "../assets/images/beers/grolsch-premium-pilsner.jpg",
        "notes": "It's hard to describe. There is a malty aroma, but the first sip is very bitter, followed by a strong alcoholic note. Only after that do I start to perceive the malt aroma through the nose.",
        "scores": {
            "maltiness": 6,
            "colorDepth": 5.5,
            "clarity": 9.5,
            "bitterness": 9.5,
            "otherAromas": 3,
            "overall": 6
        }
    },
    {
        "id": "czechvar-premium-lager",
        "name": "Czechvar Premium Lager",
        "style": "Lager",
        "abv": 5,
        "date": "2026-01-07",
        "price": 3.2,
        "imageUrl": "../assets/images/beers/czechvar-premium-lager.jpg",
        "notes": "The first sip feels quite bitter and refreshing, with a slight ale-like character. There's almost no malt aroma. Honestly, the flavor doesn't stand out at all—it feels pretty plain and unremarkable. Something intereting is the can is golden color.",
        "scores": {
            "maltiness": 2.5,
            "colorDepth": 4,
            "clarity": 9.5,
            "bitterness": 8.5,
            "otherAromas": 2,
            "overall": 4
        }
    },
    {
        "id": "hoegaarden-original-belgian-wheat",
        "name": "Hoegaarden Original Belgian Wheat",
        "style": "Wheat Beer",
        "abv": 4.9,
        "date": "2026-01-08",
        "price": 3.7,
        "imageUrl": "../assets/images/beers/hoegaarden-original-belgian-wheat.jpg",
        "notes": "This tastes like the wheat beer you'd get at Haidilao back in China. It has some orange peel notes, but they're not very strong. There's a touch of sweetness, though not the kind that comes from added sugar. Although it's not a malt-forward style of beer, overall it's not my favorite type—but it's still quite good.",
        "scores": {
            "maltiness": 1.5,
            "colorDepth": 9.5,
            "clarity": 2.5,
            "bitterness": 1.5,
            "otherAromas": 9,
            "overall": 8.5
        }
    },
    {
        "id": "lwenbru",
        "name": "Löwenbräu",
        "style": "Lager",
        "abv": 5.2,
        "date": "2026-01-08",
        "price": 2.55,
        "imageUrl": "../assets/images/beers/lwenbru.jpg",
        "notes": "The first sip is very crisp and refreshing, with a slightly sharp, peppery bite. This is followed by a lingering bitterness at the back of the tongue. Overall, the flavor is quite light, without any particularly noticeable aroma.",
        "scores": {
            "maltiness": 2,
            "colorDepth": 8,
            "clarity": 9.5,
            "bitterness": 7.5,
            "otherAromas": 1.5,
            "overall": 6
        }
    },
    {
        "id": "left-field-brewery-leafs-lager",
        "name": "Left Field Brewery Leafs Lager",
        "style": "Lager",
        "abv": 4.2,
        "date": "2026-01-08",
        "price": 3.85,
        "imageUrl": "../assets/images/beers/left-field-brewery-leafs-lager.jpg",
        "notes": "There isn’t much flavor on the first sip—it's light and almost watery, but still quite crisp. After it passes through the nose, there’s a clean, subtle aroma. It’s not particularly distinctive, but it’s solid and well-balanced.",
        "scores": {
            "maltiness": 5,
            "colorDepth": 9.5,
            "clarity": 9.5,
            "bitterness": 2,
            "otherAromas": 2,
            "overall": 6.5
        }
    },
    {
        "id": "kronenbourg-1664-lager",
        "name": "kronenbourg 1664 lager",
        "style": "Lager",
        "abv": 5,
        "date": "2026-01-09",
        "price": 3.4,
        "imageUrl": "../assets/images/beers/kronenbourg-1664-lager.jpg",
        "notes": "Kronenbourg 1664 Lager tastes fairly standard. It’s crisp on the first sip, slightly bitter, with no noticeable lingering aroma. There’s only a very faint malty aftertaste. Personally, I feel its value for money is just average.",
        "scores": {
            "maltiness": 4,
            "colorDepth": 7.5,
            "clarity": 9.5,
            "bitterness": 4.5,
            "otherAromas": 3,
            "overall": 6
        }
    },
    {
        "id": "nickel-brook-naughty-neighbor-pale-ale",
        "name": "Nickel Brook Naughty Neighbor Pale Ale",
        "style": "Pale Ale",
        "abv": 4.9,
        "date": "2026-01-09",
        "price": 3.45,
        "imageUrl": "../assets/images/beers/nickel-brook-naughty-neighbor-pale-ale.jpg",
        "notes": "The first sip has a clearly ale-like character and is fairly bitter. After that, a subtle tea-like aroma comes through on the nose. This one has a bit of lemon added, so the “tea-like” note may actually be lemon aroma. For someone like me who doesn’t usually like ales, that hint of lingering tea-like (or lemony) aroma adds a bit to the experience.",
        "scores": {
            "maltiness": 2,
            "colorDepth": 9,
            "clarity": 2,
            "bitterness": 8,
            "otherAromas": 7.5,
            "overall": 7
        }
    }
];

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function () {
        initializeNavigation();

        // Sort by overall score on initial load (matches the default dropdown value)
        const initialSorted = sortBeers(beers, 'overall');
        renderBeerGallery(initialSorted);

        initializeSorting();
        initializeImageModal();

        // Listen for language changes and re-render charts
        window.addEventListener('languageChange', function() {
            // Re-render with current sort selection
            const sortSelect = document.getElementById('sort-select');
            const currentSort = sortSelect ? sortSelect.value : 'overall';
            const sortedBeers = sortBeers(beers, currentSort);
            renderBeerGallery(sortedBeers);
        });
    });

    /**
     * Initialize mobile navigation toggle (same as main.js)
     */
    function initializeNavigation() {
        const navToggle = document.querySelector('.nav__toggle');
        const navMenu = document.querySelector('.nav__menu');

        if (!navToggle || !navMenu) return;

        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.setAttribute('id', 'nav-menu');

        navToggle.addEventListener('click', function () {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('nav__menu--open');
            navToggle.classList.toggle('nav__toggle--active');
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
    }

    /**
     * Render beer gallery
     */
    function renderBeerGallery(beerList) {
        const grid = document.getElementById('beer-grid');
        if (!grid) return;

        grid.innerHTML = '';

        beerList.forEach(function (beer) {
            const card = createBeerCard(beer);
            grid.appendChild(card);
        });
    }

    /**
     * Create a beer card element
     */
    function createBeerCard(beer) {
        const card = document.createElement('article');
        card.className = 'beer-card';
        card.setAttribute('data-beer-id', beer.id);

        // Content wrapper
        const content = document.createElement('div');
        content.className = 'beer-card__content';

        // Image container
        const imageContainer = document.createElement('div');
        imageContainer.className = 'beer-card__image-container';

        const image = document.createElement('img');
        image.className = 'beer-card__image';
        image.src = beer.imageUrl;
        image.alt = `${beer.name} - ${beer.style}`;
        image.onerror = function () {
            this.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.className = 'beer-card__image-placeholder';
            placeholder.innerHTML = '🍺';
            imageContainer.appendChild(placeholder);
        };
        imageContainer.appendChild(image);

        // Info container
        const info = document.createElement('div');
        info.className = 'beer-card__info';

        const name = document.createElement('h3');
        name.className = 'beer-card__name';
        name.textContent = beer.name;

        const meta = document.createElement('div');
        meta.className = 'beer-card__meta';
        meta.innerHTML = `<span>${beer.style}</span> <span>•</span> <span>${beer.abv}% ABV</span>`;

        // Price display (separate line)
        const priceDiv = document.createElement('div');
        priceDiv.className = 'beer-card__meta';
        const getPriceLabel = () => {
            if (typeof window !== 'undefined' && window.i18n) {
                return window.i18n.t('beer.priceLabel');
            }
            return 'Price';
        };
        const getPriceNotProvided = () => {
            if (typeof window !== 'undefined' && window.i18n) {
                return window.i18n.t('beer.priceNotProvided');
            }
            return 'Not provided';
        };
        const priceLabel = getPriceLabel();
        const priceValue = beer.price > 0 ? `$${beer.price.toFixed(2)}` : getPriceNotProvided();
        priceDiv.innerHTML = `<span>${priceLabel}</span> <span>•</span> <span>${priceValue}</span>`;

        const notes = document.createElement('p');
        notes.className = 'beer-card__notes';
        notes.textContent = beer.notes;
        notes.setAttribute('title', 'Click to expand/collapse');

        // Add click handler for expand/collapse
        notes.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('beer-card__notes--expanded');
        });

        info.appendChild(name);
        info.appendChild(meta);
        info.appendChild(priceDiv);
        info.appendChild(notes);

        // Radar chart container
        const chartContainer = document.createElement('div');
        chartContainer.className = 'beer-card__chart-container';

        // Create SVG radar chart
        const svg = createSVGRadarChart(beer.scores, `chart-${beer.id}`);
        chartContainer.appendChild(svg);

        // Assemble card
        content.appendChild(imageContainer);
        content.appendChild(info);
        content.appendChild(chartContainer);
        card.appendChild(content);

        return card;
    }

    /**
     * Create SVG radar chart for beer scores
     * Pure SVG implementation - infinitely scalable!
     * Uses i18n system for bilingual label support
     */
    function createSVGRadarChart(scores, id) {
        // Use translation keys that will be replaced by i18n system
        const getLabels = () => {
            if (typeof window !== 'undefined' && window.i18n) {
                return [
                    window.i18n.t('beer.labelMalt'),
                    window.i18n.t('beer.labelDepth'),
                    window.i18n.t('beer.labelClarity'),
                    window.i18n.t('beer.labelBitter'),
                    window.i18n.t('beer.labelAromas'),
                    window.i18n.t('beer.labelOverall')
                ];
            }
            return ['Malt', 'Depth', 'Clarity', 'Bitter', 'Aromas', 'Overall'];
        };

        const labels = getLabels();
        const data = [
            scores.maltiness,
            scores.colorDepth,
            scores.clarity,
            scores.bitterness,
            scores.otherAromas,
            scores.overall
        ];

        const size = 200;
        const center = size / 2;
        const maxRadius = size / 2 - 30;
        const levels = 5; // 0, 2, 4, 6, 8, 10
        const axes = data.length;

        // Create SVG element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
        svg.setAttribute('class', 'beer-card__chart');
        svg.setAttribute('id', id);

        // Draw background grid (concentric polygons)
        for (let level = 1; level <= levels; level++) {
            const radius = (maxRadius / levels) * level;
            const points = [];

            for (let i = 0; i < axes; i++) {
                const angle = (Math.PI * 2 * i) / axes - Math.PI / 2;
                const x = center + radius * Math.cos(angle);
                const y = center + radius * Math.sin(angle);
                points.push(`${x},${y}`);
            }

            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            polygon.setAttribute('points', points.join(' '));
            polygon.setAttribute('fill', 'none');
            polygon.setAttribute('stroke', 'rgba(0, 0, 0, 0.1)');
            polygon.setAttribute('stroke-width', '1');
            svg.appendChild(polygon);
        }

        // Draw axis lines
        for (let i = 0; i < axes; i++) {
            const angle = (Math.PI * 2 * i) / axes - Math.PI / 2;
            const x = center + maxRadius * Math.cos(angle);
            const y = center + maxRadius * Math.sin(angle);

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', center);
            line.setAttribute('y1', center);
            line.setAttribute('x2', x);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', 'rgba(0, 0, 0, 0.1)');
            line.setAttribute('stroke-width', '1');
            svg.appendChild(line);
        }

        // Draw data polygon
        const dataPoints = [];
        for (let i = 0; i < axes; i++) {
            const value = data[i];
            const radius = (maxRadius / 10) * value; // Scale to max value of 10
            const angle = (Math.PI * 2 * i) / axes - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            dataPoints.push(`${x},${y}`);
        }

        const dataPolygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        dataPolygon.setAttribute('points', dataPoints.join(' '));
        dataPolygon.setAttribute('fill', 'rgba(0, 123, 255, 0.3)');
        dataPolygon.setAttribute('stroke', 'rgba(0, 123, 255, 1)');
        dataPolygon.setAttribute('stroke-width', '2');
        svg.appendChild(dataPolygon);

        // Draw scale numbers (0, 2, 4, 6, 8, 10)
        for (let level = 1; level <= levels; level++) {
            const radius = (maxRadius / levels) * level;
            const scaleValue = (10 / levels) * level;

            // Position scale number on the first axis (top)
            const angle = -Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);

            const scaleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            scaleText.setAttribute('x', x);
            scaleText.setAttribute('y', y - 5); // Offset slightly above the line
            scaleText.setAttribute('text-anchor', 'middle');
            scaleText.setAttribute('font-size', '9');
            scaleText.setAttribute('fill', '#666');
            scaleText.textContent = scaleValue;
            svg.appendChild(scaleText);
        }

        // Create tooltip elements (will be added to SVG at the end to be on top)
        const tooltipGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        tooltipGroup.setAttribute('class', 'chart-tooltip');
        tooltipGroup.style.display = 'none';
        tooltipGroup.style.pointerEvents = 'none';

        const tooltipRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        tooltipRect.setAttribute('fill', 'rgba(0, 0, 0, 0.8)');
        tooltipRect.setAttribute('rx', '4');
        tooltipRect.setAttribute('ry', '4');

        const tooltipText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tooltipText.setAttribute('fill', '#fff');
        tooltipText.setAttribute('font-size', '11');
        tooltipText.setAttribute('font-weight', 'bold');

        tooltipGroup.appendChild(tooltipRect);
        tooltipGroup.appendChild(tooltipText);

        // Draw data points (circles) with hover effects
        const getFullLabels = () => {
            if (typeof window !== 'undefined' && window.i18n) {
                return [
                    window.i18n.t('beer.labelMaltinessFull'),
                    window.i18n.t('beer.labelColorDepthFull'),
                    window.i18n.t('beer.labelClarityFull'),
                    window.i18n.t('beer.labelBitternessFull'),
                    window.i18n.t('beer.labelOtherAromasFull'),
                    window.i18n.t('beer.labelOverallFull')
                ];
            }
            return ['Maltiness', 'Color Depth', 'Clarity', 'Bitterness', 'Other Aromas', 'Overall'];
        };

        const fullLabels = getFullLabels();

        for (let i = 0; i < axes; i++) {
            const value = data[i];
            const radius = (maxRadius / 10) * value;
            const angle = (Math.PI * 2 * i) / axes - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', '4');
            circle.setAttribute('fill', 'rgba(0, 123, 255, 1)');
            circle.setAttribute('stroke', '#fff');
            circle.setAttribute('stroke-width', '2');
            circle.style.cursor = 'pointer';

            // Add hover effects with tooltip
            circle.addEventListener('mouseenter', function() {
                this.setAttribute('r', '6');
                this.setAttribute('fill', 'rgba(255, 193, 7, 1)');

                // Set tooltip content and position
                const label = fullLabels[i];
                const text = `${label}: ${value}/10`;
                tooltipText.textContent = text;
                tooltipText.setAttribute('x', x);
                tooltipText.setAttribute('y', y - 15);
                tooltipText.setAttribute('text-anchor', 'middle');

                // Show tooltip group to enable measuring
                tooltipGroup.style.display = 'block';

                // Force a reflow to ensure text is measured correctly
                tooltipText.getBBox();

                // Now measure text to size background
                const bbox = tooltipText.getBBox();
                const padding = 6;
                tooltipRect.setAttribute('x', bbox.x - padding);
                tooltipRect.setAttribute('y', bbox.y - padding);
                tooltipRect.setAttribute('width', bbox.width + padding * 2);
                tooltipRect.setAttribute('height', bbox.height + padding * 2);
            });

            circle.addEventListener('mouseleave', function() {
                this.setAttribute('r', '4');
                this.setAttribute('fill', 'rgba(0, 123, 255, 1)');
                tooltipGroup.style.display = 'none';
            });

            svg.appendChild(circle);
        }

        // Draw labels
        for (let i = 0; i < axes; i++) {
            const angle = (Math.PI * 2 * i) / axes - Math.PI / 2;
            const labelRadius = maxRadius + 15;
            const x = center + labelRadius * Math.cos(angle);
            const y = center + labelRadius * Math.sin(angle);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x);
            text.setAttribute('y', y);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('font-size', '12');
            text.setAttribute('font-weight', 'bold');
            text.setAttribute('fill', '#333');
            text.textContent = labels[i];
            svg.appendChild(text);
        }

        // Add tooltip last so it appears on top of all other elements
        svg.appendChild(tooltipGroup);

        return svg;
    }

    /**
     * Initialize sorting functionality
     */
    function initializeSorting() {
        const sortSelect = document.getElementById('sort-select');
        if (!sortSelect) return;

        sortSelect.addEventListener('change', function () {
            const sortBy = this.value;
            const sortedBeers = sortBeers(beers, sortBy);
            renderBeerGallery(sortedBeers);
        });
    }

    /**
     * Sort beers by selected criteria
     */
    function sortBeers(beerList, sortBy) {
        const sorted = [...beerList];

        switch (sortBy) {
            case 'maltiness':
            case 'colorDepth':
            case 'clarity':
            case 'bitterness':
            case 'otherAromas':
            case 'overall':
                return sorted.sort((a, b) => b.scores[sortBy] - a.scores[sortBy]);
            case 'abv':
                // Sort by ABV (alcohol percentage) - high to low
                return sorted.sort((a, b) => b.abv - a.abv);
            case 'price':
                // Sort beers with price > 0 first (by price ascending - low to high), then beers with price = 0
                return sorted.sort((a, b) => {
                    const aHasPrice = a.price > 0;
                    const bHasPrice = b.price > 0;

                    // If both have prices or both don't have prices, sort by price (ascending - low to high)
                    if (aHasPrice === bHasPrice) {
                        return a.price - b.price;
                    }

                    // Beers with price come before beers without price
                    return bHasPrice ? 1 : -1;
                });
            case 'date':
                return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
            default:
                return sorted;
        }
    }

    /**
     * Initialize image modal functionality
     */
    function initializeImageModal() {
        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'beer-modal';
        modal.innerHTML = `
            <div class="beer-modal__overlay"></div>
            <div class="beer-modal__content">
                <button class="beer-modal__close" aria-label="Close">&times;</button>
                <img class="beer-modal__image" src="" alt="">
            </div>
        `;
        document.body.appendChild(modal);

        const overlay = modal.querySelector('.beer-modal__overlay');
        const closeBtn = modal.querySelector('.beer-modal__close');
        const modalImage = modal.querySelector('.beer-modal__image');

        // Close modal function
        function closeModal() {
            modal.classList.remove('beer-modal--active');
        }

        // Add event listeners for beer images
        document.addEventListener('click', function(e) {
            const clickedImage = e.target.closest('.beer-card__image');
            if (clickedImage) {
                modalImage.src = clickedImage.src;
                modalImage.alt = clickedImage.alt;
                modal.classList.add('beer-modal--active');
            }
        });

        // Close modal on overlay click or close button
        overlay.addEventListener('click', closeModal);
        closeBtn.addEventListener('click', closeModal);

        // Close on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('beer-modal--active')) {
                closeModal();
            }
        });
    }

})();
