document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded, initializing map...");

    let showPrevious = false;
    let svg, projection, path, tariffScale, zoom;

    function getTariffValue(countryName) {
        return showPrevious 
            ? parseFloat(tariffData[countryName].previous.replace('%', '')) 
            : parseFloat(tariffData[countryName].updated.replace('%', ''));
    }

    initMap();

    function initMap() {
        console.log("Initializing map...");
        document.body.style.overflowX = 'hidden';

        const mapContainer = document.getElementById('map-container');
        let width = mapContainer.offsetWidth;
        let height = mapContainer.offsetHeight;

        svg = d3.select('#map-container')
            .append('svg')
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
            .on('zoom', (event) => {
                svg.selectAll('.country').attr('transform', event.transform);
            })
            .filter(event => {
                return !event.button || event.type === 'touchstart' || event.type === 'touchmove';
            });

        svg.call(zoom);

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

                console.log(`Rendered ${countries.length} countries on the map`);
                document.getElementById('loading').style.display = 'none';

                updateLegend();

                const searchInput = document.getElementById('country-search');
                const countryNames = Object.keys(tariffData).sort();
                searchInput.addEventListener('input', (event) => {
                    const value = event.target.value.toLowerCase();
                    const suggestions = countryNames.filter(name => name.toLowerCase().includes(value));
                    const datalist = document.getElementById('country-suggestions');
                    datalist.innerHTML = suggestions.map(name => `<option value="${name}">`).join('');
                });
                searchInput.addEventListener('change', handleSearch);

                const toggleButton = document.getElementById('toggle-panel');
                const infoPanel = document.getElementById('info-panel');
                toggleButton.addEventListener('click', () => {
                    const isHidden = infoPanel.classList.contains('hidden');
                    infoPanel.classList.toggle('hidden');
                    toggleButton.textContent = isHidden ? 'Hide Tariff Info' : 'Show Tariff Info';
                    resizeMap(); // Immediate resize
                    // Force redraw after transition
                    setTimeout(() => {
                        resizeMap();
                        svg.selectAll('.country').attr('d', path);
                    }, 300);
                });

                const controlsContainer = document.querySelector('.controls');
                const resetButton = document.createElement('button');
                resetButton.textContent = 'Reset Zoom';
                resetButton.className = 'reset-zoom';
                resetButton.addEventListener('click', () => {
                    svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
                });
                controlsContainer.appendChild(resetButton);

                const tariffToggleButton = document.createElement('button');
                tariffToggleButton.textContent = 'Show Previous Tariffs';
                tariffToggleButton.className = 'tariff-toggle';
                tariffToggleButton.addEventListener('click', () => {
                    showPrevious = !showPrevious;
                    tariffToggleButton.textContent = showPrevious ? 'Show Updated Tariffs' : 'Show Previous Tariffs';
                    updateMapColors();
                    updateLegend();
                });
                controlsContainer.appendChild(tariffToggleButton);
            })
            .catch(error => {
                console.error('Error loading map data:', error);
                document.getElementById('loading').innerHTML = 'Error loading map. <button onclick="location.reload()">Retry</button>';
            });
    }

    function resizeMap() {
        const infoPanel = document.getElementById('info-panel');
        const isPanelVisible = !infoPanel.classList.contains('hidden');
        const isMobile = window.innerWidth <= 768;
        const mapContainer = document.getElementById('map-container');
        const header = document.querySelector('.header');
        const headerHeight = header ? header.offsetHeight : 0;
    
        // Use full container width
        let width = mapContainer.parentElement.offsetWidth;
        if (!isMobile && isPanelVisible) {
            width = Math.max(width - 300, 0); // Adjust for panel
        }
        let height = isMobile ? window.innerHeight * 0.6 : window.innerHeight - headerHeight;
    
        // Force SVG to match
        svg.style('width', '100%')
           .style('max-width', 'none')
           .attr('width', width)
           .attr('height', height)
           .attr('viewBox', [0, 0, width, height]);
    
        projection
            .scale(width / (isMobile ? 4.5 : 5.5))
            .translate([width / 2, height / 2]);
    
        svg.selectAll('.country')
           .attr('d', path);
    }
    
   // Toggle handler (in initMap)
toggleButton.addEventListener('click', () => {
    const isHidden = infoPanel.classList.contains('hidden');
    infoPanel.classList.toggle('hidden');
    toggleButton.textContent = isHidden ? 'Hide Tariff Info' : 'Show Tariff Info';
    // Immediate resize
    resizeMap();
    // Force layout recalculation
    mapContainer.style.width = '100%';
    // Redraw after transition
    setTimeout(() => {
        mapContainer.style.width = '100%';
        resizeMap();
        svg.selectAll('.country').attr('d', path);
    }, 310); // Slightly after transition
});

    function updateMapColors() {
        tariffScale.domain(showPrevious ? [10, 50] : [10, 145]);
        svg.selectAll('.country')
            .transition()
            .duration(window.innerWidth <= 768 ? 200 : 500)
            .style('fill', d => {
                const alpha3 = numericToAlpha3[d.id];
                const countryName = countryCodeToName[alpha3];
                const tariff = countryName && tariffData[countryName] ? getTariffValue(countryName) : null;
                return tariff ? tariffScale(tariff) : '#555';
            });
    }

    function updateLegend() {
        const legend = d3.select('#legend');
        legend.selectAll('*').remove();

        legend.append('div')
            .attr('class', 'legend-title')
            .text(showPrevious ? 'Previous Tariff Rates' : 'Updated Tariff Rates');

        const maxTariff = showPrevious ? 50 : 145;
        legend.append('div')
            .attr('class', 'legend-item')
            .html(`
                <div class="legend-color gradient" style="background: linear-gradient(to right, ${tariffScale(10)}, ${tariffScale(maxTariff)});"></div>
                <span>10% - ${maxTariff}%</span>
            `);

        const keyTariffs = showPrevious ? [10, 50] : [10, 145];
        keyTariffs.forEach(tariff => {
            legend.append('div')
                .attr('class', 'legend-item')
                .html(`
                    <div class="legend-color" style="background-color: ${tariffScale(tariff)}"></div>
                    <span>${tariff}%</span>
                `);
        });

        legend.append('div')
            .attr('class', 'legend-item')
            .html(`
                <div class="legend-color no-data"></div>
                <span>No Tariff Data</span>
            `);
    }

    function handleMouseOver(event, d) {
        if (window.innerWidth > 768) {
            const alpha3 = numericToAlpha3[d.id];
            const countryName = countryCodeToName[alpha3];
            if (countryName) showTooltip(event, countryName);
        }
    }

    function handleMouseMove(event) {
        if (window.innerWidth > 768) {
            updateTooltipPosition(event);
        }
    }

    function handleMouseOut() {
        if (window.innerWidth > 768) {
            hideTooltip();
        }
    }

    function handleClick(event, d) {
        const alpha3 = numericToAlpha3[d.id];
        const countryName = countryCodeToName[alpha3];
        if (!countryName) return;

        console.log(`Country ${event.type === 'click' ? 'clicked' : 'tapped'}: ${countryName}`);
        d3.selectAll('.country').classed('selected', false);
        d3.select(event.currentTarget).classed('selected', true);
        updateCountryInfo(countryName);

        const infoPanel = document.getElementById('info-panel');
        const toggleButton = document.getElementById('toggle-panel');
        if (infoPanel.classList.contains('hidden')) {
            infoPanel.classList.remove('hidden');
            toggleButton.textContent = 'Hide Tariff Info';
            resizeMap();
            setTimeout(() => {
                resizeMap();
                svg.selectAll('.country').attr('d', path);
            }, 300);
        }
    }

    function handleSearch(event) {
        const countryName = event.target.value;
        if (!countryName || !tariffData[countryName]) return;

        const country = svg.select(`#country-${Object.keys(numericToAlpha3).find(key => countryCodeToName[numericToAlpha3[key]] === countryName)}`);
        if (!country.empty()) {
            d3.selectAll('.country').classed('selected', false);
            country.classed('selected', true);
            svg.transition().call(zoom.translateTo, country.node().getBBox().x + country.node().getBBox().width / 2, country.node().getBBox().y + country.node().getBBox().height / 2);
        }
        updateCountryInfo(countryName);
        event.target.value = '';

        const infoPanel = document.getElementById('info-panel');
        const toggleButton = document.getElementById('toggle-panel');
        if (infoPanel.classList.contains('hidden')) {
            infoPanel.classList.remove('hidden');
            toggleButton.textContent = 'Hide Tariff Info';
            resizeMap();
            setTimeout(() => {
                resizeMap();
                svg.selectAll('.country').attr('d', path);
            }, 300);
        }
    }

    function showTooltip(event, countryName) {
        const tooltip = document.getElementById('tooltip');
        const data = tariffData[countryName];
        tooltip.innerHTML = data
            ? `${countryName === 'European Union' ? `${countryName} (Shared Tariff)` : countryName}<br>Imports: ${data.imports === 'NA' ? 'Not Available' : data.imports}<br>Previous: ${data.previous}<br>Updated: ${data.updated}`
            : `${countryName}<br>No Tariff Data`;
        tooltip.style.display = 'block';
        tooltip.classList.add('visible');
        updateTooltipPosition(event);
    }

    function updateTooltipPosition(event) {
        const tooltip = document.getElementById('tooltip');
        tooltip.style.left = (event.pageX + 10) + 'px';
        tooltip.style.top = (event.pageY + 10) + 'px';
    }

    function hideTooltip() {
        const tooltip = document.getElementById('tooltip');
        tooltip.classList.remove('visible');
        setTimeout(() => { tooltip.style.display = 'none'; }, 100);
    }

    function updateCountryInfo(countryName) {
        const infoPanel = document.getElementById('country-info');
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
});
