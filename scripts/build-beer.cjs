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

        // Render statistics charts
        renderStatisticsCharts();

        // Sort by overall score on initial load (matches the default dropdown value)
        const initialSorted = sortBeers(beers, 'overall');
        renderBeerGallery(initialSorted);
        updateBeerCount(beers.length);

        initializeSorting();
        initializeImageModal();

        // Listen for language changes and re-render charts and count
        window.addEventListener('languageChange', function() {
            // Re-render with current sort selection
            const sortSelect = document.getElementById('sort-select');
            const currentSort = sortSelect ? sortSelect.value : 'overall';
            const sortedBeers = sortBeers(beers, currentSort);
            renderBeerGallery(sortedBeers);
            updateBeerCount(beers.length);
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
     * Update beer count display
     */
    function updateBeerCount(count) {
        const countElement = document.getElementById('beer-count');
        if (!countElement) return;

        const getCountText = () => {
            if (typeof window !== 'undefined' && window.i18n) {
                return window.i18n.t('beer.totalBeers');
            }
            return 'Total Beers';
        };

        const countText = getCountText();
        countElement.textContent = \`\${countText}: \${count}\`;
    }

    /**
     * Render all statistics charts
     */
    function renderStatisticsCharts() {
        renderStylePieChart();
        renderAbvHistogram();
        renderMaltScoreScatter();
    }

    /**
     * Render beer style distribution pie chart
     */
    function renderStylePieChart() {
        const svg = document.getElementById('style-pie-chart');
        if (!svg) return;

        // Count beers by style
        const styleCounts = {};
        beers.forEach(beer => {
            styleCounts[beer.style] = (styleCounts[beer.style] || 0) + 1;
        });

        // Convert to array and sort by count
        const styleData = Object.entries(styleCounts)
            .map(([style, count]) => ({ style, count }))
            .sort((a, b) => b.count - a.count);

        // Colors from your theme
        const colors = [
            '#007bff', '#17a2b8', '#28a745', '#ffc107',
            '#dc3545', '#6610f2', '#fd7e14', '#20c997',
            '#e83e8c', '#6c757d'
        ];

        const width = 300;
        const height = 300;
        const radius = Math.min(width, height) / 2 - 20;
        const centerX = width / 2;
        const centerY = height / 2;

        svg.setAttribute('viewBox', \`0 0 \${width} \${height}\`);
        svg.innerHTML = '';

        // Calculate total for percentages
        const total = styleData.reduce((sum, d) => sum + d.count, 0);

        // Draw pie slices
        let currentAngle = -Math.PI / 2; // Start from top
        styleData.forEach((d, i) => {
            const sliceAngle = (d.count / total) * 2 * Math.PI;
            const endAngle = currentAngle + sliceAngle;

            // Create path for pie slice
            const x1 = centerX + radius * Math.cos(currentAngle);
            const y1 = centerY + radius * Math.sin(currentAngle);
            const x2 = centerX + radius * Math.cos(endAngle);
            const y2 = centerY + radius * Math.sin(endAngle);

            const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

            const pathData = [
                \`M \${centerX} \${centerY}\`,
                \`L \${x1} \${y1}\`,
                \`A \${radius} \${radius} 0 \${largeArcFlag} 1 \${x2} \${y2}\`,
                'Z'
            ].join(' ');

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', pathData);
            path.setAttribute('fill', colors[i % colors.length]);
            path.setAttribute('stroke', '#fff');
            path.setAttribute('stroke-width', '2');
            path.style.cursor = 'pointer';

            // Add hover effect
            path.addEventListener('mouseenter', function() {
                this.setAttribute('opacity', '0.8');
            });
            path.addEventListener('mouseleave', function() {
                this.setAttribute('opacity', '1');
            });

            // Add label
            const midAngle = currentAngle + sliceAngle / 2;
            const labelRadius = radius * 0.7;
            const labelX = centerX + labelRadius * Math.cos(midAngle);
            const labelY = centerY + labelRadius * Math.sin(midAngle);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', labelX);
            text.setAttribute('y', labelY);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('fill', '#fff');
            text.setAttribute('font-size', '12');
            text.setAttribute('font-weight', 'bold');
            text.textContent = d.count;

            svg.appendChild(path);
            svg.appendChild(text);

            currentAngle = endAngle;
        });

        // Add legend
        const legendX = 10;
        let legendY = 10;
        styleData.forEach((d, i) => {
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', legendX);
            rect.setAttribute('y', legendY);
            rect.setAttribute('width', '12');
            rect.setAttribute('height', '12');
            rect.setAttribute('fill', colors[i % colors.length]);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', legendX + 16);
            text.setAttribute('y', legendY + 10);
            text.setAttribute('font-size', '10');
            text.setAttribute('fill', '#333');
            text.textContent = \`\${d.style} (\${d.count})\`;

            svg.appendChild(rect);
            svg.appendChild(text);

            legendY += 16;
        });
    }

    /**
     * Render ABV distribution histogram
     */
    function renderAbvHistogram() {
        const svg = document.getElementById('abv-histogram');
        if (!svg) return;

        const width = 300;
        const height = 300;
        const margin = { top: 20, right: 20, bottom: 40, left: 40 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        svg.setAttribute('viewBox', \`0 0 \${width} \${height}\`);
        svg.innerHTML = '';

        // Create bins for ABV ranges
        const binSize = 0.5;
        const minAbv = Math.floor(Math.min(...beers.map(b => b.abv)) / binSize) * binSize;
        const maxAbv = Math.ceil(Math.max(...beers.map(b => b.abv)) / binSize) * binSize;

        const bins = [];
        for (let i = minAbv; i < maxAbv; i += binSize) {
            bins.push({
                min: i,
                max: i + binSize,
                count: 0,
                label: \`\${i.toFixed(1)}-\${(i + binSize).toFixed(1)}\`
            });
        }

        beers.forEach(beer => {
            const bin = bins.find(b => beer.abv >= b.min && beer.abv < b.max);
            if (bin) bin.count++;
        });

        const maxCount = Math.max(...bins.map(b => b.count));

        // Draw bars
        const barWidth = chartWidth / bins.length - 2;
        bins.forEach((bin, i) => {
            const barHeight = (bin.count / maxCount) * chartHeight;
            const x = margin.left + i * (chartWidth / bins.length);
            const y = margin.top + chartHeight - barHeight;

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', y);
            rect.setAttribute('width', barWidth);
            rect.setAttribute('height', barHeight);
            rect.setAttribute('fill', '#007bff');
            rect.setAttribute('stroke', '#fff');
            rect.setAttribute('stroke-width', '1');
            rect.style.cursor = 'pointer';

            rect.addEventListener('mouseenter', function() {
                this.setAttribute('fill', '#0056b3');
            });
            rect.addEventListener('mouseleave', function() {
                this.setAttribute('fill', '#007bff');
            });

            // Add count label on top of bar
            if (bin.count > 0) {
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', x + barWidth / 2);
                text.setAttribute('y', y - 5);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('font-size', '10');
                text.setAttribute('fill', '#333');
                text.textContent = bin.count;
                svg.appendChild(text);
            }

            svg.appendChild(rect);
        });

        // Draw axes
        const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        xAxis.setAttribute('x1', margin.left);
        xAxis.setAttribute('y1', height - margin.bottom);
        xAxis.setAttribute('x2', width - margin.right);
        xAxis.setAttribute('y2', height - margin.bottom);
        xAxis.setAttribute('stroke', '#333');
        xAxis.setAttribute('stroke-width', '2');
        svg.appendChild(xAxis);

        const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        yAxis.setAttribute('x1', margin.left);
        yAxis.setAttribute('y1', margin.top);
        yAxis.setAttribute('x2', margin.left);
        yAxis.setAttribute('y2', height - margin.bottom);
        yAxis.setAttribute('stroke', '#333');
        yAxis.setAttribute('stroke-width', '2');
        svg.appendChild(yAxis);

        // Add x-axis label
        const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        xLabel.setAttribute('x', width / 2);
        xLabel.setAttribute('y', height - 5);
        xLabel.setAttribute('text-anchor', 'middle');
        xLabel.setAttribute('font-size', '12');
        xLabel.setAttribute('fill', '#333');
        xLabel.textContent = 'ABV (%)';
        svg.appendChild(xLabel);

        // Add y-axis label
        const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        yLabel.setAttribute('x', 10);
        yLabel.setAttribute('y', 15);
        yLabel.setAttribute('font-size', '12');
        yLabel.setAttribute('fill', '#333');
        yLabel.textContent = 'Count';
        svg.appendChild(yLabel);
    }

    /**
     * Render Maltiness vs Overall Score scatter plot
     */
    function renderMaltScoreScatter() {
        const svg = document.getElementById('malt-score-scatter');
        if (!svg) return;

        const width = 300;
        const height = 300;
        const margin = { top: 20, right: 20, bottom: 40, left: 40 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        svg.setAttribute('viewBox', \`0 0 \${width} \${height}\`);
        svg.innerHTML = '';

        const minMalt = 0;
        const maxMalt = 10;
        const minScore = 0;
        const maxScore = 10;

        // Draw axes
        const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        xAxis.setAttribute('x1', margin.left);
        xAxis.setAttribute('y1', height - margin.bottom);
        xAxis.setAttribute('x2', width - margin.right);
        xAxis.setAttribute('y2', height - margin.bottom);
        xAxis.setAttribute('stroke', '#333');
        xAxis.setAttribute('stroke-width', '2');
        svg.appendChild(xAxis);

        const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        yAxis.setAttribute('x1', margin.left);
        yAxis.setAttribute('y1', margin.top);
        yAxis.setAttribute('x2', margin.left);
        yAxis.setAttribute('y2', height - margin.bottom);
        yAxis.setAttribute('stroke', '#333');
        yAxis.setAttribute('stroke-width', '2');
        svg.appendChild(yAxis);

        // Draw grid lines
        for (let i = 2; i <= 10; i += 2) {
            // Horizontal grid lines (for overall score)
            const y = margin.top + chartHeight - ((i - minScore) / (maxScore - minScore)) * chartHeight;
            const hGridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            hGridLine.setAttribute('x1', margin.left);
            hGridLine.setAttribute('y1', y);
            hGridLine.setAttribute('x2', width - margin.right);
            hGridLine.setAttribute('y2', y);
            hGridLine.setAttribute('stroke', 'rgba(0, 0, 0, 0.1)');
            hGridLine.setAttribute('stroke-width', '1');
            svg.appendChild(hGridLine);

            const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            yLabel.setAttribute('x', margin.left - 5);
            yLabel.setAttribute('y', y + 3);
            yLabel.setAttribute('text-anchor', 'end');
            yLabel.setAttribute('font-size', '10');
            yLabel.setAttribute('fill', '#666');
            yLabel.textContent = i;
            svg.appendChild(yLabel);

            // Vertical grid lines (for maltiness)
            const x = margin.left + ((i - minMalt) / (maxMalt - minMalt)) * chartWidth;
            const vGridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            vGridLine.setAttribute('x1', x);
            vGridLine.setAttribute('y1', margin.top);
            vGridLine.setAttribute('x2', x);
            vGridLine.setAttribute('y2', height - margin.bottom);
            vGridLine.setAttribute('stroke', 'rgba(0, 0, 0, 0.1)');
            vGridLine.setAttribute('stroke-width', '1');
            svg.appendChild(vGridLine);

            const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            xLabel.setAttribute('x', x);
            xLabel.setAttribute('y', height - margin.bottom + 15);
            xLabel.setAttribute('text-anchor', 'middle');
            xLabel.setAttribute('font-size', '10');
            xLabel.setAttribute('fill', '#666');
            xLabel.textContent = i;
            svg.appendChild(xLabel);
        }

        // Plot points
        beers.forEach(beer => {
            const x = margin.left + ((beer.scores.maltiness - minMalt) / (maxMalt - minMalt)) * chartWidth;
            const y = margin.top + chartHeight - ((beer.scores.overall - minScore) / (maxScore - minScore)) * chartHeight;

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', '4');
            circle.setAttribute('fill', '#007bff');
            circle.setAttribute('stroke', '#fff');
            circle.setAttribute('stroke-width', '1');
            circle.style.cursor = 'pointer';

            circle.addEventListener('mouseenter', function() {
                this.setAttribute('r', '6');
                this.setAttribute('fill', '#ffc107');
            });
            circle.addEventListener('mouseleave', function() {
                this.setAttribute('r', '4');
                this.setAttribute('fill', '#007bff');
            });

            svg.appendChild(circle);
        });

        // Add x-axis label
        const xAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        xAxisLabel.setAttribute('x', width / 2);
        xAxisLabel.setAttribute('y', height - 5);
        xAxisLabel.setAttribute('text-anchor', 'middle');
        xAxisLabel.setAttribute('font-size', '12');
        xAxisLabel.setAttribute('fill', '#333');
        xAxisLabel.textContent = 'Maltiness';
        svg.appendChild(xAxisLabel);

        // Add y-axis label
        const yAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        yAxisLabel.setAttribute('x', 10);
        yAxisLabel.setAttribute('y', 15);
        yAxisLabel.setAttribute('font-size', '12');
        yAxisLabel.setAttribute('fill', '#333');
        yAxisLabel.textContent = 'Overall';
        svg.appendChild(yAxisLabel);
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
        const priceValue = beer.price > 0 ? \`$\${beer.price.toFixed(2)}\` : getPriceNotProvided();
        priceDiv.innerHTML = \`<span>\${priceLabel}</span> <span>•</span> <span>\${priceValue}</span>\`;

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
        const svg = createSVGRadarChart(beer.scores, \`chart-\${beer.id}\`);
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
        svg.setAttribute('viewBox', \`0 0 \${size} \${size}\`);
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
                points.push(\`\${x},\${y}\`);
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
            dataPoints.push(\`\${x},\${y}\`);
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
                const text = \`\${label}: \${value}/10\`;
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
