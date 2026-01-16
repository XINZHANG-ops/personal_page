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

    // Global filter state
    let activeFilter = {
        type: null,  // 'style', 'abv', 'price', or 'maltScore'
        value: null  // style name, range {min, max}, or {maltiness, overall} for scatter point
    };

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
            const filteredBeers = applyFilter(beers);
            const sortedBeers = sortBeers(filteredBeers, currentSort);
            renderBeerGallery(sortedBeers);
            updateBeerCount(filteredBeers.length);
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
     * Apply active filter to beer list
     */
    function applyFilter(beerList) {
        if (!activeFilter.type) {
            return beerList;
        }

        if (activeFilter.type === 'style') {
            return beerList.filter(beer => beer.style === activeFilter.value);
        }

        if (activeFilter.type === 'abv') {
            return beerList.filter(beer =>
                beer.abv >= activeFilter.value.min && beer.abv <= activeFilter.value.max
            );
        }

        if (activeFilter.type === 'price') {
            return beerList.filter(beer =>
                beer.price >= activeFilter.value.min && beer.price <= activeFilter.value.max
            );
        }

        if (activeFilter.type === 'maltScore') {
            return beerList.filter(beer =>
                beer.scores.maltiness === activeFilter.value.maltiness &&
                beer.scores.overall === activeFilter.value.overall
            );
        }

        return beerList;
    }

    /**
     * Update display with current filter and sort
     */
    function updateDisplay() {
        const sortSelect = document.getElementById('sort-select');
        const currentSort = sortSelect ? sortSelect.value : 'overall';
        const filteredBeers = applyFilter(beers);
        const sortedBeers = sortBeers(filteredBeers, currentSort);
        renderBeerGallery(sortedBeers);
        updateBeerCount(filteredBeers.length);
    }

    /**
     * Set filter and update display
     */
    function setFilter(type, value) {
        // Toggle off if clicking the same filter
        if (activeFilter.type === type &&
            ((type === 'style' && activeFilter.value === value) ||
             ((type === 'abv' || type === 'price') && activeFilter.value.min === value.min && activeFilter.value.max === value.max) ||
             (type === 'maltScore' && activeFilter.value.maltiness === value.maltiness && activeFilter.value.overall === value.overall))) {
            activeFilter = { type: null, value: null };
        } else {
            activeFilter = { type, value };
        }

        // Re-render charts to update visual state
        renderStatisticsCharts();

        // Update beer display
        updateDisplay();
    }

    /**
     * Render all statistics charts
     */
    function renderStatisticsCharts() {
        renderStylePieChart();
        renderAbvHistogram();
        renderPriceHistogram();
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

        // Modern color palette with better visual appeal
        const colors = [
            '#4A90E2', '#7B68EE', '#50C878', '#FFB347',
            '#FF6B9D', '#00CED1', '#FF7F50', '#9370DB',
            '#20B2AA', '#DDA0DD'
        ];

        const width = 300;
        const height = 300;
        const radius = Math.min(width, height) / 2 - 20;
        const centerX = width / 2;
        const centerY = height / 2;

        svg.setAttribute('viewBox', \`0 0 \${width} \${height}\`);
        svg.innerHTML = '';

        // Add drop shadow filter
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', 'drop-shadow');
        filter.setAttribute('x', '-50%');
        filter.setAttribute('y', '-50%');
        filter.setAttribute('width', '200%');
        filter.setAttribute('height', '200%');

        const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        feGaussianBlur.setAttribute('in', 'SourceAlpha');
        feGaussianBlur.setAttribute('stdDeviation', '3');
        filter.appendChild(feGaussianBlur);

        const feOffset = document.createElementNS('http://www.w3.org/2000/svg', 'feOffset');
        feOffset.setAttribute('dx', '0');
        feOffset.setAttribute('dy', '2');
        feOffset.setAttribute('result', 'offsetblur');
        filter.appendChild(feOffset);

        const feComponentTransfer = document.createElementNS('http://www.w3.org/2000/svg', 'feComponentTransfer');
        const feFuncA = document.createElementNS('http://www.w3.org/2000/svg', 'feFuncA');
        feFuncA.setAttribute('type', 'linear');
        feFuncA.setAttribute('slope', '0.3');
        feComponentTransfer.appendChild(feFuncA);
        filter.appendChild(feComponentTransfer);

        const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
        const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        feMergeNode2.setAttribute('in', 'SourceGraphic');
        feMerge.appendChild(feMergeNode1);
        feMerge.appendChild(feMergeNode2);
        filter.appendChild(feMerge);

        defs.appendChild(filter);
        svg.appendChild(defs);

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

            // Check if this slice is currently filtered
            const isActive = activeFilter.type === 'style' && activeFilter.value === d.style;
            const isOtherActive = activeFilter.type === 'style' && activeFilter.value !== d.style;

            // Set initial opacity based on filter state
            if (isActive) {
                path.setAttribute('opacity', '1');
            } else if (isOtherActive) {
                path.setAttribute('opacity', '0.3');
            } else {
                path.setAttribute('opacity', '1');
            }

            // Create label group for hover
            const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            labelGroup.setAttribute('pointer-events', 'none');
            labelGroup.style.display = 'none';

            const labelText = \`\${d.style}: \${d.count} beer\${d.count > 1 ? 's' : ''}\`;
            const textWidth = labelText.length * 6;
            const padding = 6;

            // Background rectangle
            const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bgRect.setAttribute('x', centerX - textWidth / 2 - padding);
            bgRect.setAttribute('y', centerY - 25);
            bgRect.setAttribute('width', textWidth + padding * 2);
            bgRect.setAttribute('height', 18);
            bgRect.setAttribute('fill', 'rgba(255, 255, 255, 0.95)');
            bgRect.setAttribute('stroke', '#333');
            bgRect.setAttribute('stroke-width', '1');
            bgRect.setAttribute('rx', '3');
            labelGroup.appendChild(bgRect);

            // Text
            const textElem = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            textElem.setAttribute('x', centerX);
            textElem.setAttribute('y', centerY - 13);
            textElem.setAttribute('text-anchor', 'middle');
            textElem.setAttribute('font-size', '11');
            textElem.setAttribute('fill', '#333');
            textElem.setAttribute('font-weight', 'bold');
            textElem.textContent = labelText;
            labelGroup.appendChild(textElem);

            svg.appendChild(labelGroup);

            // Add hover effect with shadow
            path.addEventListener('mouseenter', function() {
                if (!isOtherActive) {
                    this.setAttribute('opacity', '0.9');
                    this.style.filter = 'url(#drop-shadow)';
                    labelGroup.style.display = 'block';
                    svg.appendChild(labelGroup);
                }
            });
            path.addEventListener('mouseleave', function() {
                if (isActive) {
                    this.setAttribute('opacity', '1');
                } else if (isOtherActive) {
                    this.setAttribute('opacity', '0.3');
                } else {
                    this.setAttribute('opacity', '1');
                }
                this.style.filter = '';
                labelGroup.style.display = 'none';
            });

            // Add click event to filter by style
            path.addEventListener('click', function() {
                setFilter('style', d.style);
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
            // For the last bin, use <= to include the max value (e.g., ABV = 10.0)
            const bin = bins.find((b, idx) =>
                beer.abv >= b.min && (idx === bins.length - 1 ? beer.abv <= b.max : beer.abv < b.max)
            );
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
            rect.style.cursor = 'pointer';

            // Check if this bar is currently filtered
            const isActive = activeFilter.type === 'abv' &&
                activeFilter.value.min === bin.min &&
                activeFilter.value.max === bin.max;
            const isOtherActive = activeFilter.type === 'abv' &&
                (activeFilter.value.min !== bin.min || activeFilter.value.max !== bin.max);

            // Set fill and opacity based on filter state with rounded corners
            if (isActive) {
                rect.setAttribute('fill', '#5B9BD5');
                rect.setAttribute('opacity', '1');
            } else if (isOtherActive) {
                rect.setAttribute('fill', '#5B9BD5');
                rect.setAttribute('opacity', '0.3');
            } else {
                rect.setAttribute('fill', '#5B9BD5');
                rect.setAttribute('opacity', '1');
            }
            rect.setAttribute('stroke', '#fff');
            rect.setAttribute('stroke-width', '1');
            rect.setAttribute('rx', '3');
            rect.setAttribute('ry', '3');

            // Create label group for hover
            const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            labelGroup.setAttribute('pointer-events', 'none');
            labelGroup.style.display = 'none';

            const labelText = \`ABV: \${bin.min.toFixed(1)}%-\${bin.max.toFixed(1)}% (\${bin.count} beer\${bin.count > 1 ? 's' : ''})\`;
            const textWidth = labelText.length * 5.5;
            const padding = 6;

            // Background rectangle
            const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bgRect.setAttribute('x', x + barWidth / 2 - textWidth / 2 - padding);
            bgRect.setAttribute('y', y - 25);
            bgRect.setAttribute('width', textWidth + padding * 2);
            bgRect.setAttribute('height', 18);
            bgRect.setAttribute('fill', 'rgba(255, 255, 255, 0.95)');
            bgRect.setAttribute('stroke', '#333');
            bgRect.setAttribute('stroke-width', '1');
            bgRect.setAttribute('rx', '3');
            labelGroup.appendChild(bgRect);

            // Text
            const textElem = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            textElem.setAttribute('x', x + barWidth / 2);
            textElem.setAttribute('y', y - 13);
            textElem.setAttribute('text-anchor', 'middle');
            textElem.setAttribute('font-size', '10');
            textElem.setAttribute('fill', '#333');
            textElem.setAttribute('font-weight', 'bold');
            textElem.textContent = labelText;
            labelGroup.appendChild(textElem);

            svg.appendChild(labelGroup);

            rect.addEventListener('mouseenter', function() {
                if (!isOtherActive) {
                    this.setAttribute('fill', '#4178BE');
                    this.style.filter = 'url(#drop-shadow)';
                    labelGroup.style.display = 'block';
                    svg.appendChild(labelGroup);
                }
            });
            rect.addEventListener('mouseleave', function() {
                this.setAttribute('fill', '#5B9BD5');
                this.style.filter = '';
                labelGroup.style.display = 'none';
            });

            // Add click event to filter by ABV range
            rect.addEventListener('click', function() {
                setFilter('abv', { min: bin.min, max: bin.max });
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
     * Render price distribution histogram
     */
    function renderPriceHistogram() {
        const svg = document.getElementById('price-histogram');
        if (!svg) return;

        const width = 300;
        const height = 300;
        const margin = { top: 20, right: 20, bottom: 40, left: 40 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        svg.setAttribute('viewBox', \`0 0 \${width} \${height}\`);
        svg.innerHTML = '';

        // Filter beers with price data
        const beersWithPrice = beers.filter(b => b.price && b.price > 0);
        if (beersWithPrice.length === 0) return;

        // Find price range
        const prices = beersWithPrice.map(b => b.price);
        const minPrice = Math.floor(Math.min(...prices));
        const maxPrice = Math.ceil(Math.max(...prices));

        // Create bins (e.g., $1 increments)
        const binSize = 1.0;
        const bins = [];
        for (let i = minPrice; i < maxPrice; i += binSize) {
            bins.push({ min: i, max: i + binSize, count: 0 });
        }

        // Count beers in each bin
        beersWithPrice.forEach(beer => {
            // For the last bin, use <= to include the max value
            const bin = bins.find((b, idx) =>
                beer.price >= b.min && (idx === bins.length - 1 ? beer.price <= b.max : beer.price < b.max)
            );
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
            rect.style.cursor = 'pointer';

            // Check if this bar is currently filtered
            const isActive = activeFilter.type === 'price' &&
                activeFilter.value.min === bin.min &&
                activeFilter.value.max === bin.max;
            const isOtherActive = activeFilter.type === 'price' &&
                (activeFilter.value.min !== bin.min || activeFilter.value.max !== bin.max);

            // Set fill and opacity based on filter state with rounded corners
            if (isActive) {
                rect.setAttribute('fill', '#70C1B3');
                rect.setAttribute('opacity', '1');
            } else if (isOtherActive) {
                rect.setAttribute('fill', '#70C1B3');
                rect.setAttribute('opacity', '0.3');
            } else {
                rect.setAttribute('fill', '#70C1B3');
                rect.setAttribute('opacity', '1');
            }
            rect.setAttribute('stroke', '#fff');
            rect.setAttribute('stroke-width', '1');
            rect.setAttribute('rx', '3');
            rect.setAttribute('ry', '3');

            // Create label group for hover
            const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            labelGroup.setAttribute('pointer-events', 'none');
            labelGroup.style.display = 'none';

            const labelText = \`Price: $\${bin.min.toFixed(2)}-$\${bin.max.toFixed(2)} (\${bin.count} beer\${bin.count > 1 ? 's' : ''})\`;
            const textWidth = labelText.length * 5.5;
            const padding = 6;

            // Background rectangle
            const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bgRect.setAttribute('x', x + barWidth / 2 - textWidth / 2 - padding);
            bgRect.setAttribute('y', y - 25);
            bgRect.setAttribute('width', textWidth + padding * 2);
            bgRect.setAttribute('height', 18);
            bgRect.setAttribute('fill', 'rgba(255, 255, 255, 0.95)');
            bgRect.setAttribute('stroke', '#333');
            bgRect.setAttribute('stroke-width', '1');
            bgRect.setAttribute('rx', '3');
            labelGroup.appendChild(bgRect);

            // Text
            const textElem = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            textElem.setAttribute('x', x + barWidth / 2);
            textElem.setAttribute('y', y - 13);
            textElem.setAttribute('text-anchor', 'middle');
            textElem.setAttribute('font-size', '10');
            textElem.setAttribute('fill', '#333');
            textElem.setAttribute('font-weight', 'bold');
            textElem.textContent = labelText;
            labelGroup.appendChild(textElem);

            svg.appendChild(labelGroup);

            rect.addEventListener('mouseenter', function() {
                if (!isOtherActive) {
                    this.setAttribute('fill', '#5AAA95');
                    this.style.filter = 'url(#drop-shadow)';
                    labelGroup.style.display = 'block';
                    svg.appendChild(labelGroup);
                }
            });
            rect.addEventListener('mouseleave', function() {
                this.setAttribute('fill', '#70C1B3');
                this.style.filter = '';
                labelGroup.style.display = 'none';
            });

            // Add click event to filter by price range
            rect.addEventListener('click', function() {
                setFilter('price', { min: bin.min, max: bin.max });
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
        xLabel.textContent = 'Price ($)';
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

        // Group beers by same maltiness and overall score
        const pointGroups = {};
        beers.forEach(beer => {
            const key = \`\${beer.scores.maltiness},\${beer.scores.overall}\`;
            if (!pointGroups[key]) {
                pointGroups[key] = [];
            }
            pointGroups[key].push(beer);
        });

        // Store circles and labels for two-pass rendering
        const circlesData = [];

        // First pass: Create text labels and prepare circle data
        Object.entries(pointGroups).forEach(([key, beersAtPoint]) => {
            const maltiness = beersAtPoint[0].scores.maltiness;
            const overall = beersAtPoint[0].scores.overall;
            const x = margin.left + ((maltiness - minMalt) / (maxMalt - minMalt)) * chartWidth;
            const y = margin.top + chartHeight - ((overall - minScore) / (maxScore - minScore)) * chartHeight;

            // Check if this point is currently filtered
            const isActive = activeFilter.type === 'maltScore' &&
                activeFilter.value.maltiness === maltiness &&
                activeFilter.value.overall === overall;
            const isOtherActive = activeFilter.type === 'maltScore' &&
                (activeFilter.value.maltiness !== maltiness || activeFilter.value.overall !== overall);

            // Prepare beer names for display (max 3, each on new line with number prefix)
            const beerNamesArray = beersAtPoint.slice(0, 3).map((b, idx) => \`\${idx + 1}. \${b.name}\`);
            if (beersAtPoint.length > 3) {
                beerNamesArray.push('...');
            }

            // Create label group for hover with background
            const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            labelGroup.setAttribute('pointer-events', 'none');
            labelGroup.style.display = 'none';

            // Background rectangle
            const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bgRect.setAttribute('fill', 'rgba(255, 255, 255, 0.95)');
            bgRect.setAttribute('stroke', '#333');
            bgRect.setAttribute('stroke-width', '1');
            bgRect.setAttribute('rx', '3');

            // Create text lines (one per beer)
            const lineHeight = 12;
            const startY = y - 10 - (beerNamesArray.length * lineHeight);
            const maxTextWidth = Math.max(...beerNamesArray.map(n => n.length)) * 6;
            const padding = 4;

            beerNamesArray.forEach((name, idx) => {
                const textLine = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                textLine.setAttribute('x', x + 10);
                textLine.setAttribute('y', startY + (idx * lineHeight) + 10);
                textLine.setAttribute('font-size', '10');
                textLine.setAttribute('fill', '#333');
                textLine.setAttribute('font-weight', 'bold');
                textLine.textContent = name;
                labelGroup.appendChild(textLine);
            });

            // Set background rectangle dimensions
            bgRect.setAttribute('x', x + 10 - padding);
            bgRect.setAttribute('y', startY);
            bgRect.setAttribute('width', maxTextWidth + padding * 2);
            bgRect.setAttribute('height', beerNamesArray.length * lineHeight + padding);
            labelGroup.insertBefore(bgRect, labelGroup.firstChild);

            svg.appendChild(labelGroup);

            // Store circle data for second pass
            circlesData.push({
                x, y, maltiness, overall, isActive, isOtherActive,
                beersAtPoint, labelGroup, beerNamesArray
            });
        });

        // Calculate maximum radius based on 0.5 score units (minimum distance between points)
        const unitDistance = (0.5 / (maxMalt - minMalt)) * chartWidth;
        const maxRadiusLimit = unitDistance / 2; // Diameter should not exceed 0.5 units
        const minRadiusLimit = 4; // Minimum radius for visibility

        // Find min and max beer counts across all points
        const beerCounts = circlesData.map(d => d.beersAtPoint.length);
        const minBeerCount = Math.min(...beerCounts);
        const maxBeerCount = Math.max(...beerCounts);

        // Function to calculate radius based on beer count
        // Scale by area (area proportional to beer count)
        const getRadius = (beerCount) => {
            if (maxBeerCount === minBeerCount) {
                // If all points have same count, use middle size
                return (minRadiusLimit + maxRadiusLimit) / 2;
            }
            // We want area to be proportional to beer count
            // Area = π * r^2, so if we want area ratio = count ratio,
            // then r^2 ratio = count ratio, so r ratio = sqrt(count ratio)

            // Calculate area limits
            const minArea = Math.PI * minRadiusLimit * minRadiusLimit;
            const maxArea = Math.PI * maxRadiusLimit * maxRadiusLimit;

            // Linear interpolation of area based on beer count
            const areaRatio = (beerCount - minBeerCount) / (maxBeerCount - minBeerCount);
            const targetArea = minArea + areaRatio * (maxArea - minArea);

            // Convert area back to radius: r = sqrt(area / π)
            return Math.sqrt(targetArea / Math.PI);
        };

        // Second pass: Create and append circles (so they appear on top)
        circlesData.forEach(data => {
            const { x, y, maltiness, overall, isActive, isOtherActive, beersAtPoint, labelGroup, beerNamesArray } = data;

            // Calculate radius based on number of beers at this point
            const beerCount = beersAtPoint.length;
            const radius = getRadius(beerCount);

            // Create circle
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', radius.toString());
            circle.style.cursor = 'pointer';

            // Set fill and opacity based on filter state
            if (isActive) {
                circle.setAttribute('fill', '#FFB84D');
                circle.setAttribute('opacity', '1');
            } else if (isOtherActive) {
                circle.setAttribute('fill', '#9370DB');
                circle.setAttribute('opacity', '0.3');
            } else {
                circle.setAttribute('fill', '#9370DB');
                circle.setAttribute('opacity', '1');
            }
            circle.setAttribute('stroke', '#fff');
            circle.setAttribute('stroke-width', '2');

            // Create tooltip (native browser tooltip)
            const tooltipText = beerNamesArray.join('\\n');
            const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            title.textContent = \`\${tooltipText}\\nMalt: \${maltiness}, Overall: \${overall}\`;
            circle.appendChild(title);

            // Hover effects
            circle.addEventListener('mouseenter', function() {
                if (!isOtherActive) {
                    this.setAttribute('r', (radius + 2).toString());
                    this.setAttribute('fill', '#FFB84D');
                    this.style.filter = 'url(#drop-shadow)';
                    labelGroup.style.display = 'block';
                    // Move labelGroup to end of SVG so it appears on top of all circles
                    svg.appendChild(labelGroup);
                }
            });
            circle.addEventListener('mouseleave', function() {
                this.setAttribute('r', radius.toString());
                if (isActive) {
                    this.setAttribute('fill', '#FFB84D');
                } else {
                    this.setAttribute('fill', '#9370DB');
                }
                this.style.filter = '';
                labelGroup.style.display = 'none';
            });

            // Click to filter
            circle.addEventListener('click', function() {
                setFilter('maltScore', { maltiness, overall });
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
            updateDisplay();
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
