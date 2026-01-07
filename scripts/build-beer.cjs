#!/usr/bin/env node

/**
 * Build script to generate beer.js from beer.jsonl
 * This script reads the JSONL data file and generates the JavaScript file
 */

const fs = require('fs');
const path = require('path');

console.log('🍺 Building beer.js from data/beer.jsonl...');

const JSONL_FILE = 'data/beer.jsonl';
const OUTPUT_FILE = 'js/beer.js';
const TEMPLATE_FILE = 'js/beer-template.js';

// Read JSONL file
if (!fs.existsSync(JSONL_FILE)) {
    console.error('❌ Error: data/beer.jsonl not found!');
    console.log('💡 Tip: Use the Gradio UI (python add_beer.py) to add beers');
    process.exit(1);
}

const beers = [];
const fileContent = fs.readFileSync(JSONL_FILE, 'utf8');
const lines = fileContent.trim().split('\n');

for (const line of lines) {
    if (line.trim()) {
        try {
            const beer = JSON.parse(line);
            // Update image URL to work from pages/ directory
            if (beer.imageUrl && !beer.imageUrl.startsWith('../')) {
                beer.imageUrl = '../' + beer.imageUrl;
            }
            beers.push(beer);
        } catch (e) {
            console.error('❌ Error parsing line:', line);
            console.error(e.message);
            process.exit(1);
        }
    }
}

console.log(`📊 Found ${beers.length} beer(s)`);

// Read template if it exists, otherwise create from scratch
let template;
if (fs.existsSync(TEMPLATE_FILE)) {
    template = fs.readFileSync(TEMPLATE_FILE, 'utf8');
} else {
    // Default template
    template = `// Beer scoring data and functionality
(function () {
    'use strict';

    // Beer data structure
    // This file is AUTO-GENERATED from data/beer.jsonl
    // To add new beers, use: python add_beer.py
    // Then rebuild with: npm run build-beer
    const beers = {{BEERS_DATA}};

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
        image.alt = \`\${beer.name} - \${beer.style}\`;
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
        meta.innerHTML = \`<span>\${beer.style}</span> <span>•</span> <span>\${beer.abv}% ABV</span>\`;

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
        canvas.id = \`chart-\${beer.id}\`;
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
        modal.innerHTML = \`
            <div class="beer-modal__overlay"></div>
            <div class="beer-modal__content">
                <button class="beer-modal__close" aria-label="Close">&times;</button>
                <img class="beer-modal__image" src="" alt="">
            </div>
        \`;
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
`;
}

// Generate beers data as JavaScript array
const beersData = JSON.stringify(beers, null, 4);

// Replace placeholder in template
const output = template.replace('{{BEERS_DATA}}', beersData);

// Write output file
fs.writeFileSync(OUTPUT_FILE, output, 'utf8');

console.log(`✅ Generated ${OUTPUT_FILE}`);
console.log(`📝 Contains ${beers.length} beer(s)`);

// Show summary
if (beers.length > 0) {
    console.log('\n📊 Recent beers:');
    const recentBeers = [...beers]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    recentBeers.forEach(beer => {
        console.log(`   • ${beer.name} (${beer.style}, ${beer.abv}% ABV) - Overall: ${beer.scores.overall}/10`);
    });
}

console.log('\n✨ Build complete! Your beer.js is ready.');
console.log('💡 Next: Open beer.html in your browser to see your beers\n');
