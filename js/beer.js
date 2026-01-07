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
            "appearance": 8.5,
            "aroma": 9,
            "flavor": 8.7,
            "mouthfeel": 8,
            "drinkability": 8.5,
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
            "appearance": 9,
            "aroma": 8.5,
            "flavor": 9.2,
            "mouthfeel": 9,
            "drinkability": 7.5,
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
            "appearance": 10,
            "aroma": 10,
            "flavor": 10,
            "mouthfeel": 6,
            "drinkability": 6,
            "overall": 6
        }
    }
];

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function () {
        initializeNavigation();
        renderBeerGallery(beers);
        initializeSorting();
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
        card.appendChild(imageContainer);
        card.appendChild(info);
        card.appendChild(chartContainer);

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
                labels: ['Appearance', 'Aroma', 'Flavor', 'Mouthfeel', 'Drinkability', 'Overall'],
                datasets: [{
                    label: 'Score',
                    data: [
                        scores.appearance,
                        scores.aroma,
                        scores.flavor,
                        scores.mouthfeel,
                        scores.drinkability,
                        scores.overall
                    ],
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    borderColor: 'rgba(99, 102, 241, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(99, 102, 241, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(99, 102, 241, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 10,
                        min: 0,
                        ticks: {
                            stepSize: 2,
                            font: {
                                size: 10
                            }
                        },
                        pointLabels: {
                            font: {
                                size: 11,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return context.label + ': ' + context.parsed.r.toFixed(1) + '/10';
                            }
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
            case 'appearance':
            case 'aroma':
            case 'flavor':
            case 'mouthfeel':
            case 'drinkability':
            case 'overall':
                return sorted.sort((a, b) => b.scores[sortBy] - a.scores[sortBy]);
            case 'date':
                return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
            default:
                return sorted;
        }
    }

})();
