document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded, initializing...");

    let showPrevious = false;
    let svg, projection, path, tariffScale, zoom, width, height, mapContainer;
    let selectedCountryId = null;
    let tooltipTimeout = null;

    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function getTariffValue(countryName) {
        return showPrevious 
            ? parseFloat(tariffData[countryName].previous.replace('%', '')) 
            : parseFloat(tariffData[countryName].updated.replace('%', ''));
    }

    function resizeMap() {
        const infoPanel = document.getElementById('info-panel');
        const isPanelVisible = infoPanel && !infoPanel.classList.contains('hidden');
        const isMobile = window.innerWidth <= 768;
        mapContainer = mapContainer || document.getElementById('map-container');
        const banner = document.getElementById('banner');
        const headerHeight = banner && !banner.classList.contains('hidden') ? 50 : 35;

        width = mapContainer.offsetWidth;
        if (!isMobile && isPanelVisible) {
            width = Math.max(width - 300, 0);
        }
        height = isMobile ? window.innerHeight * 0.6 : window.innerHeight - headerHeight;

        svg.style('width', '100%')
           .style('max-width', 'none')
           .attr('width', width)
           .attr('height', height)
           .attr('viewBox', [0, 0, width, height]);

        projection
            .scale(width / (isMobile ? 4.5 : 5.5))
            .translate([width / 2, height / 2]);

        svg.selectAll('.country').attr('d', path);
    }

    function updateMapColors() {
        tariffScale.domain(showPrevious ? [10, 50] : [10, 145]);
        svg.selectAll('.country')
            .style('fill', d => {
                const alpha3 = numericToAlpha3[d.id];
                const countryName = countryCodeToName[alpha3];
                const tariff = countryName && tariffData[countryName] ? getTariffValue(countryName) : null;
                return tariff ? tariffScale(tariff) : '#555';
            });
    }

    function handleMouseOver(event, d) {
        if (window.innerWidth <= 768) return; // Disable tooltip on mobile
        clearTimeout(tooltipTimeout);
        const alpha3 = numericToAlpha3[d.id];
        const countryName = countryCodeToName[alpha3];
        if (countryName) {
            showTooltip(event, countryName);
        }
    }

    function handleMouseMove(event) {
        if (window.innerWidth <= 768) return;
        updateTooltipPosition(event);
    }

    function handleMouseOut() {
        if (window.innerWidth <= 768) return;
        tooltipTimeout = setTimeout(hideTooltip, 100); // Delay hide to prevent flicker
    }

    function handleClick(event, d) {
        const alpha3 = numericToAlpha3[d.id];
        const countryName = countryCodeToName[alpha3];
        const infoPanel = document.getElementById('info-panel');

        if (!countryName) {
            if (infoPanel && !infoPanel.classList.contains('hidden')) {
                infoPanel.classList.add('hidden');
                d3.selectAll('.country').classed('selected', false);
                selectedCountryId = null;
                svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
                resizeMap();
            }
            return;
        }

        console.log(`Country clicked: ${countryName}`);

        if (selectedCountryId === d.id) {
            infoPanel.classList.add('hidden');
            d3.selectAll('.country').classed('selected', false);
            selectedCountryId = null;
            svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
            resizeMap();
        } else {
            d3.selectAll('.country').classed('selected', false);
            d3.select(event.currentTarget).classed('selected', true);
            selectedCountryId = d.id;

            const bounds = path.bounds(d);
            const cx = (bounds[0][0] + bounds[1][0]) / 2;
            const cy = (bounds[0][1] + bounds[1][1]) / 2;
            let scale = Math.max(2, Math.min(12, 150 / Math.max(bounds[1][0] - bounds[0][0], bounds[1][1] - bounds[0][1])));
            if (d.id === '554' || d.id === '242') {
                scale = 5;
                const lon = d.id === '554' ? 174 : 179;
                const lat = d.id === '554' ? -42 : -18;
                const projected = projection([lon, lat]);
                svg.transition()
                    .duration(750)
                    .call(zoom.transform, d3.zoomIdentity.translate(width / 2 - scale * projected[0], height / 2 - scale * projected[1]).scale(scale));
            } else {
                const translate = [width / 2 - scale * cx, height / 2 - scale * cy];
                svg.transition()
                    .duration(750)
                    .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
            }

            updateCountryInfo(countryName);
            infoPanel.classList.remove('hidden');
            resizeMap();
        }
    }

    function showTooltip(event, countryName) {
        const tooltip = document.getElementById('tooltip');
        const data = tariffData[countryName];
        tooltip.innerHTML = data
            ? `${countryName === 'European Union' ? `${countryName} (Shared Tariff)` : countryName}<br>Imports: ${data.imports === 'NA' ? 'Not Available' : data.imports}<br>Previous: ${data.previous}<br>Updated: ${data.updated}`
            : `${countryName}<br>No Tariff Data`;
        tooltip.style.display = 'block';
        tooltip.style.opacity = '0';
        tooltip.style.position = 'absolute';
        tooltip.style.zIndex = '1001';
        tooltip.classList.add('visible');
        // Force reflow to ensure opacity transition
        tooltip.offsetHeight;
        tooltip.style.opacity = '1';
        updateTooltipPosition(event);
    }

    function updateTooltipPosition(event) {
        const tooltip = document.getElementById('tooltip');
        const tooltipRect = tooltip.getBoundingClientRect();
        let left = event.pageX + 10;
        let top = event.pageY + 10;

        // Prevent tooltip from going off-screen
        if (left + tooltipRect.width > window.innerWidth) {
            left = event.pageX - tooltipRect.width - 10;
        }
        if (top + tooltipRect.height > window.innerHeight) {
            top = event.pageY - tooltipRect.height - 10;
        }

        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    }

    function hideTooltip() {
        const tooltip = document.getElementById('tooltip');
        tooltip.classList.remove('visible');
        tooltip.style.opacity = '0';
        setTimeout(() => {
            if (!tooltip.classList.contains('visible')) {
                tooltip.style.display = 'none';
            }
        }, 100);
    }

    function updateCountryInfo(countryName, tariffResult = null) {
        const infoPanel = document.getElementById('country-info');
        
        if (tariffResult) {
            const { origin, destination, item, quantity, price, tariffData } = tariffResult;
            let html = `<h2 class="country-name">${origin}</h2>`;
            
            if (!tariffData) {
                html += `<div class="no-data">No tariff data available for ${origin}</div>`;
            } else {
                const normalCost = quantity * price;
                const baseTariffRate = parseFloat(tariffData.updated.replace('%', '')) / 100;
                const isMaterial = item === 'Steel' || item === 'Aluminum';
                const additionalTariff = isMaterial ? 0.25 : 0; // 25% for Steel/Aluminum
                const totalTariffRate = baseTariffRate + additionalTariff;
                const actualCost = normalCost * (1 + totalTariffRate);
    
                html += `
                    <div class="tariff-result">
                        <p><span class="tariff-label">Origin:</span> ${origin}</p>
                        <p><span class="tariff-label">Destination:</span> ${destination}</p>
                        <p><span class="tariff-label">Product/Material:</span> ${item || 'Not Specified'}</p>
                        <p><span class="tariff-label">Quantity:</span> ${formatNumber(quantity)}</p>
                        <p><span class="tariff-label">Price per Unit:</span> $${formatNumber(price.toFixed(2))}</p>
                        <p><span class="tariff-label">Base Tariff Rate:</span> ${tariffData.updated}</p>
                `;
                if (isMaterial) {
                    html += `
                        <p><span class="tariff-label">232 Tariff:</span> 25%</p>
                        <p><span class="tariff-label">Total Tariff Rate:</span> ${(totalTariffRate * 100).toFixed(1)}%</p>
                    `;
                }
                html += `
                        <p><span class="cost-label">Normal Cost:</span> $${formatNumber(normalCost.toFixed(2))}</p>
                        <p><span class="cost-label">Actual Cost (with Tariffs):</span> $${formatNumber(actualCost.toFixed(2))}</p>
                    </div>
                `;
            }
            infoPanel.innerHTML = html;
            return;
        }
    
        const data = tariffData[countryName];
        if (!data) {
            infoPanel.innerHTML = `
                <h2 class="country-name">${countryName}</h2>
                <div class="no-data">No tariff data available</div>
            `;
            return;
        }
    
        const prevRate = parseFloat(data.previous.replace('%', ''));
        const newRate = parseFloat(data.updated.replace('%', ''));
        const changeClass = newRate > prevRate ? 'increase' : newRate < prevRate ? 'decrease' : 'no-change';
        const changeSymbol = newRate > prevRate ? '↑' : newRate < prevRate ? '↓' : '→';
    
        infoPanel.innerHTML = `
            <h2 class="country-name">${countryName}</h2>
            <div class="tariff-card">
                <div class="tariff-label">Share of US Imports</div>
                <div class="tariff-value">${data.imports}</div>
            </div>
            <div class="tariff-card">
                <div class="tariff-label">Previous Tariff Rate</div>
                <div class="tariff-value">${data.previous}</div>
            </div>
            <div class="tariff-card">
                <div class="tariff-label">Updated Tariff Rate</div>
                <div class="tariff-value">${data.updated}</div>
                <div class="comparison ${changeClass}">
                    <span class="arrow">${changeSymbol}</span>
                    ${Math.abs(newRate - prevRate)}% ${newRate > prevRate ? 'increase' : newRate < prevRate ? 'decrease' : 'no change'}
                </div>
            </div>
        `;
    }

    function handleSearch(countryName, isCalculate = false, tariffResult = null) {
        if (!countryName || !tariffData[countryName]) return;

        const alpha3 = Object.keys(countryCodeToName).find(code => countryCodeToName[code] === countryName);
        const numericId = Object.keys(numericToAlpha3).find(key => numericToAlpha3[key] === alpha3);
        const country = svg.select(`#country-${numericId}`);
        if (!country.empty()) {
            d3.selectAll('.country').classed('selected', false);
            country.classed('selected', true);
            selectedCountryId = numericId;
            const bounds = path.bounds(country.datum());
            const cx = (bounds[0][0] + bounds[1][0]) / 2;
            const cy = (bounds[0][1] + bounds[1][1]) / 2;
            let scale = Math.max(2, Math.min(12, 150 / Math.max(bounds[1][0] - bounds[0][0], bounds[1][1] - bounds[0][1])));
            if (numericId === '554' || numericId === '242') {
                scale = 5;
                const lon = numericId === '554' ? 174 : 179;
                const lat = numericId === '554' ? -42 : -18;
                const projected = projection([lon, lat]);
                svg.transition()
                    .duration(750)
                    .call(zoom.transform, d3.zoomIdentity.translate(width / 2 - scale * projected[0], height / 2 - scale * projected[1]).scale(scale));
            } else {
                const translate = [width / 2 - scale * cx, height / 2 - scale * cy];
                svg.transition()
                    .duration(750)
                    .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
            }
        }
        updateCountryInfo(countryName, isCalculate ? tariffResult : null);
        const infoPanel = document.getElementById('info-panel');
        infoPanel.classList.remove('hidden');
        resizeMap();
    }

    function updateLegend() {
        const legend = d3.select('#legend');
        legend.selectAll('*').remove();

        legend.append('div')
            .attr('class', 'legend-title')
            .text(showPrevious ? 'Previous Tariff Rates' : 'Current Tariff Rates');

        const maxTariff = showPrevious ? 50 : 145;
        legend.append('div')
            .attr('class', 'legend-item')
            .html(`
                <span class="legend-color gradient"></span>
                <span>10% - ${maxTariff}%</span>
            `)
            .select('.gradient')
            .style('background', `linear-gradient(to right, ${tariffScale(10)}, ${tariffScale(maxTariff)})`);

        const keyTariffs = showPrevious ? [10, 50] : [10, 145];
        keyTariffs.forEach(tariff => {
            legend.append('div')
                .attr('class', 'legend-item')
                .html(`
                    <span class="legend-color"></span>
                    <span>${tariff}%</span>
                `)
                .select('.legend-color')
                .style('background-color', tariffScale(tariff));
        });

        legend.append('div')
            .attr('class', 'legend-item')
            .html(`
                <span class="legend-color no-data"></span>
                <span>No Tariff Data</span>
            `);
    }

    function zoomed(event) {
        const { transform } = event;
        let { x, y, k } = transform;

        const maxX = width * 0.5;
        const minX = -width * 0.5;
        const maxY = height * 0.5;
        const minY = -height * 0.5;

        if (k <= 1.1) {
            x = Math.max(minX, Math.min(maxX, x));
            y = Math.max(minY, Math.min(maxY, y));
        }

        svg.selectAll('.country')
            .attr('transform', `translate(${x},${y}) scale(${k})`);
    }

    function initMap() {
        console.log("Initializing map...");
        document.body.style.overflowX = 'hidden';

        mapContainer = document.getElementById('map-container');
        width = mapContainer.offsetWidth;
        height = mapContainer.offsetHeight;

        svg = d3.select('#map-container')
            .append('svg')
            .style('width', '100%')
            .style('max-width', 'none')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', [0, 0, width, height]);

        console.log(`Created SVG with dimensions: ${width}x${height}`);

        projection = d3.geoMercator()
            .scale(width / 5.5)
            .center([0, 20])
            .translate([width / 2, height / 2]);

        path = d3.geoPath().projection(projection);

        tariffScale = d3.scaleLinear()
            .domain(showPrevious ? [10, 50] : [10, 145])
            .range(['#FFFACD', '#B22222']);

        zoom = d3.zoom()
            .scaleExtent([1, 12])
            .on('zoom', zoomed)
            .filter(event => {
                return !event.button || event.type === 'touchstart' || event.type === 'touchmove';
            });

        svg.call(zoom);
        svg.call(zoom.transform, d3.zoomIdentity);

        // Tariff data processing
        const tariffCountries = new Set(Object.keys(tariffData));
        const euCodes = Object.keys(countryCodeToName).filter(code => countryCodeToName[code] === "European Union");
        const missingCountries = Object.values(countryCodeToName)
            .filter(name => !tariffCountries.has(name) && name !== "European Union")
            .filter((name, index, self) => self.indexOf(name) === index); // Unique names

// Populate origin search
const originSearch = document.getElementById('origin-search');
if (originSearch) {
    const countryNames = Object.keys(tariffData).filter(name => name !== 'United States').sort();
    countryNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        originSearch.appendChild(option);
    });
    originSearch.addEventListener('change', (event) => {
        handleSearch(event.target.value);
    });
}

// Calculate button logic
const calculateButton = document.getElementById('calculate-button');
if (calculateButton) {
    calculateButton.addEventListener('click', () => {
        const origin = document.getElementById('origin-search').value;
        const material = document.getElementById('material-select').value;
        const quantity = parseFloat(document.getElementById('quantity-input').value);
        const price = parseFloat(document.getElementById('price-input').value);

        if (!origin || !tariffData[origin]) {
            alert('Please select a valid origin country.');
            return;
        }
        if (isNaN(quantity) || quantity <= 0) {
            alert('Please enter a valid quantity greater than 0.');
            return;
        }
        if (isNaN(price) || price <= 0) {
            alert('Please enter a valid price greater than 0.');
            return;
        }

        const tariffResult = {
            origin,
            destination: 'United States',
            item: material,
            quantity,
            price,
            tariffData: tariffData[origin]

            
        };


        handleSearch(origin, true, tariffResult);
    });
}
        // Tariff slider logic
        const tariffSlider = document.getElementById('tariff-slider');
        if (tariffSlider) {
            tariffSlider.addEventListener('input', () => {
                showPrevious = tariffSlider.value === '0';
                updateMapColors();
                updateLegend();
            });
        }

        console.log("Loading map data...");
        fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json', { cache: 'force-cache' })
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                console.log("Map data loaded successfully");
                return response.json();
            })
            .then(data => {
                console.log("Processing map data...");
                let countries = topojson.feature(data, data.objects.countries).features;

                countries.forEach(feature => {
                    if (!feature.geometry) {
                        console.warn(`Feature ID ${feature.id}: no geometry, skipping`);
                    }
                });

                svg.selectAll('.country')
                    .data(countries)
                    .enter()
                    .append('path')
                    .attr('class', d => {
                        const alpha3 = numericToAlpha3[d.id];
                        const countryName = countryCodeToName[alpha3];
                        const hasTariff = countryName && tariffData[countryName];
                        return hasTariff ? 'country has-tariff' : 'country no-data';
                    })
                    .style('fill', d => {
                        const alpha3 = numericToAlpha3[d.id];
                        const countryName = countryCodeToName[alpha3];
                        const tariff = countryName && tariffData[countryName] ? getTariffValue(countryName) : null;
                        return tariff ? tariffScale(tariff) : '#555';
                    })
                    .attr('data-alpha3', d => numericToAlpha3[d.id] || '')
                    .attr('d', path)
                    .attr('id', d => `country-${d.id}`)
                    .attr('role', 'button')
                    .attr('aria-label', d => countryCodeToName[numericToAlpha3[d.id]] || 'Unknown Country')
                    .attr('tabindex', 0)
                    .on('mouseover', handleMouseOver)
                    .on('mousemove', handleMouseMove)
                    .on('mouseout', handleMouseOut)
                    .on('click', handleClick)
                    .on('keydown', function(event, d) {
                        if (event.key === 'Enter' || event.key === ' ') {
                            handleClick.call(this, event, d);
                        }
                    });

                svg.append('rect')
                    .attr('x', -width)
                    .attr('y', -height)
                    .attr('width', width * 3)
                    .attr('height', height * 3)
                    .style('fill', 'none')
                    .style('pointer-events', 'all')
                    .lower()
                    .on('click', (event) => handleClick(event, {}));

                console.log(`Rendered ${countries.length} countries on the map`);
                document.getElementById('loading').style.display = 'none';

                updateLegend();

                window.addEventListener('resize', resizeMap);
            })
            .catch(error => {
                console.error('Error loading map data:', error);
                document.getElementById('loading').innerHTML = 'Error loading map. <button onclick="location.reload()">Retry</button>';
            });
    }

// Shared functionality
const menuToggle = document.getElementById('menu-toggle');
const controls = document.getElementById('controls');
if (menuToggle && controls) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        controls.classList.toggle('hidden');
    });
}

    // Initialize map only on main page
    if (document.getElementById('map-container')) {
        initMap();
    }
});
