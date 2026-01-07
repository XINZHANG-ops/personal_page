// Beer scoring data and functionality
(function () {
    'use strict';

    // Beer data structure
    // This file is AUTO-GENERATED from data/beer.jsonl
    // To add new beers, use: python add_beer.py
    // Then rebuild with: npm run build-beer
    const beers = [
    {
        "id": "example-ipa",
        "name": "Example IPA",
        "style": "India Pale Ale",
        "abv": 6.5,
        "date": "2024-01-15",
        "imageUrl": "assets/images/beers/example-ipa.png",
        "notes": "A fantastic example of a West Coast IPA with bold citrus and pine notes. Clean finish with just the right amount of bitterness.",
        "scores": {
            "maltiness": 7.5,
            "colorDepth": 6,
            "clarity": 9,
            "bitterness": 9.5,
            "otherAromas": 8.5,
            "overall": 8.6
        }
    },
    {
        "id": "sample-stout",
        "name": "Sample Imperial Stout",
        "style": "Imperial Stout",
        "abv": 10.5,
        "date": "2024-01-10",
        "imageUrl": "assets/images/beers/sample-stout.png",
        "notes": "Rich, velvety stout with notes of dark chocolate, coffee, and vanilla. Perfect for a cold evening.",
        "scores": {
            "maltiness": 9.5,
            "colorDepth": 10,
            "clarity": 7,
            "bitterness": 6.5,
            "otherAromas": 9,
            "overall": 8.8
        }
    },
    {
        "id": "xin-test",
        "name": "xin test",
        "style": "Belgian",
        "abv": 4.3,
        "date": "2026-01-07",
        "imageUrl": "assets/images/beers/xin-test.png",
        "notes": "this is a test beer",
        "scores": {
            "maltiness": 8,
            "colorDepth": 7,
            "clarity": 6,
            "bitterness": 5,
            "otherAromas": 7.5,
            "overall": 6
        }
    }
];

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function () {
        initializeNavigation();
        renderBeerGallery(beers);
        initializeSorting();
        initializeImageModal();
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

        const notes = document.createElement('p');
        notes.className = 'beer-card__notes';
        notes.textContent = beer.notes;

        info.appendChild(name);
        info.appendChild(meta);
        info.appendChild(notes);

        // Radar chart container
        const chartContainer = document.createElement('div');
        chartContainer.className = 'beer-card__chart-container';

        const canvas = document.createElement('canvas');
        canvas.className = 'beer-card__chart';
        canvas.id = `chart-${beer.id}`;
        chartContainer.appendChild(canvas);

        // Assemble card
        content.appendChild(imageContainer);
        content.appendChild(info);
        content.appendChild(chartContainer);
        card.appendChild(content);

        // Create radar chart after card is added to DOM
        setTimeout(() => createRadarChart(canvas.id, beer.scores), 0);

        return card;
    }

    /**
     * Create radar chart for beer scores
     */
    function createRadarChart(canvasId, scores) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Malt', 'Depth', 'Clarity', 'Bitter', 'Aromas', 'Overall'],
                datasets: [{
                    label: 'Score',
                    data: [
                        scores.maltiness,
                        scores.colorDepth,
                        scores.clarity,
                        scores.bitterness,
                        scores.otherAromas,
                        scores.overall
                    ],
                    backgroundColor: 'rgba(0, 123, 255, 0.2)',
                    borderColor: 'rgba(0, 123, 255, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(0, 123, 255, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(0, 123, 255, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const fullLabels = ['Maltiness', 'Color Depth', 'Clarity', 'Bitterness', 'Other Aromas', 'Overall'];
                                return fullLabels[context.dataIndex] + ': ' + context.parsed.r.toFixed(1) + '/10';
                            }
                        }
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 10,
                        min: 0,
                        backgroundColor: 'transparent',
                        ticks: {
                            stepSize: 2,
                            font: {
                                size: 10
                            },
                            backdropColor: 'transparent'
                        },
                        pointLabels: {
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                }
            }
        });
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
