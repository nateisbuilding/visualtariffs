document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded, initializing map...");

    let showPrevious = false;
    let svg, projection, path, tariffScale, zoom, width, height, mapContainer;
    let selectedCountryId = null;

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
        const headerHeight = banner && !banner.classList.contains('hidden') ? 120 : 70;
    
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
        const infoPanel = document.getElementById('info-panel');

        if (!countryName) {
            // Ocean or invalid click
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
            // Second click
            infoPanel.classList.add('hidden');
            d3.selectAll('.country').classed('selected', false);
            selectedCountryId = null;
            svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
            resizeMap();
        } else {
            // First or different country
            d3.selectAll('.country').classed('selected', false);
            d3.select(event.currentTarget).classed('selected', true);
            selectedCountryId = d.id;

            // Zoom to country
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

            // Update and show info panel
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
        tooltip.style.position = 'absolute';
        tooltip.style.zIndex = '1001';
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
        setTimeout(() => { 
            tooltip.style.display = 'none';
            tooltip.style.zIndex = '1001';
        }, 100);
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

    function handleSearch(event) {
        const countryName = event.target.value;
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
        updateCountryInfo(countryName);
        const infoPanel = document.getElementById('info-panel');
        infoPanel.classList.remove('hidden');
        resizeMap();
        event.target.value = '';
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
            `)
            .select('.no-data')
            .style('background-color', '#555')
            .style('width', '12px')
            .style('height', '12px');
    }

    function zoomed(event) {
        const { transform } = event;
        let { x, y, k } = transform;

        // Calculate boundaries when fully zoomed out (k ≈ 1)
        const maxX = width * 0.5;
        const minX = -width * 0.5;
        const maxY = height * 0.5;
        const minY = -height * 0.5;

        // Clamp translation when zoom scale is close to 1
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

        // Banner close logic
        const banner = document.getElementById('banner');
        const closeBanner = document.getElementById('close-banner');
        if (banner && closeBanner) {
            // Clear localStorage to ensure banner is visible
            localStorage.removeItem('bannerClosed');
            
            // Ensure banner is visible
            banner.classList.remove('hidden');
            document.getElementById('map-container').classList.remove('no-banner');
            document.getElementById('info-panel').classList.remove('no-banner');
            document.getElementById('controls').classList.remove('no-banner');
            
            closeBanner.addEventListener('click', () => {
                banner.classList.add('hidden');
                document.getElementById('map-container').classList.add('no-banner');
                document.getElementById('info-panel').classList.add('no-banner');
                document.getElementById('controls').classList.add('no-banner');
                localStorage.setItem('bannerClosed', 'true');
                resizeMap();
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

                const searchInput = document.getElementById('country-search');
                const countryNames = Object.keys(tariffData).sort();
                searchInput.addEventListener('input', (event) => {
                    const value = event.target.value.toLowerCase();
                    const suggestions = countryNames.filter(name => name.toLowerCase().includes(value));
                    const datalist = document.getElementById('country-suggestions');
                    datalist.innerHTML = suggestions.map(name => `<option value="${name}">`).join('');
                });
                searchInput.addEventListener('change', handleSearch);

                const tariffToggleButton = document.getElementById('tariff-toggle');
                if (tariffToggleButton) {
                    tariffToggleButton.addEventListener('click', () => {
                        showPrevious = !showPrevious;
                        tariffToggleButton.textContent = showPrevious ? 'Show Updated Tariffs' : 'Show Previous Tariffs';
                        updateMapColors();
                        updateLegend();
                    });
                }

                const menuToggle = document.getElementById('menu-toggle');
                const controls = document.getElementById('controls');
                if (menuToggle && controls) {
                    menuToggle.addEventListener('click', () => {
                        menuToggle.classList.toggle('active');
                        controls.classList.toggle('hidden');
                    });
                }

                window.addEventListener('resize', resizeMap);
            })
            .catch(error => {
                console.error('Error loading map data:', error);
                document.getElementById('loading').innerHTML = 'Error loading map. <button onclick="location.reload()">Retry</button>';
            });
    }

    initMap();
});
