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
            beers.push(JSON.parse(line));
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
                labels: ['Maltiness', 'Color Depth', 'Clarity', 'Bitterness', 'Other Aromas', 'Overall'],
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
