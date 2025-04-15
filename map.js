import { initUI } from './ui.js';

export function initMap(updateCountryInfo) {
  const mapContainer = document.getElementById('map-container');
  const width = mapContainer.offsetWidth;
  const height = mapContainer.offsetHeight;

  const svg = d3.select('#map-container')
    .append('svg')
    .style('width', '100%')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height]);

  const projection = d3.geoMercator()
    .scale(width / 5.5)
    .center([0, 20])
    .translate([width / 2, height / 2]);

  const path = d3.geoPath().projection(projection);

  const tariffScale = d3.scaleLinear()
    .domain([10, 145])
    .range(['#FFFACD', '#B22222']); // Lemon chiffon to firebrick

  const zoom = d3.zoom()
    .scaleExtent([1, 12])
    .on('zoom', (event) => {
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
      svg.selectAll('.country').attr('transform', `translate(${x},${y}) scale(${k})`);
    });

  svg.call(zoom);
  svg.call(zoom.transform, d3.zoomIdentity);

  // Initialize UI once
  const ui = initUI(svg, tariffScale);

  function getTariffValue(countryName, showPrevious) {
    const data = window.tariffData[countryName];
    if (!data) return null;
    const rate = showPrevious ? data.previous : data.updated;
    return parseFloat(rate.replace('%', ''));
  }

  function updateMapColors(showPrevious) {
    tariffScale.domain(showPrevious ? [10, 50] : [10, 145]);
    svg.selectAll('.country')
      .style('fill', d => {
        const alpha3 = window.numericToAlpha3[d.id];
        const countryName = window.countryCodeToName[alpha3];
        const tariff = countryName && window.tariffData[countryName] ? getTariffValue(countryName, showPrevious) : null;
        return tariff != null && tariff > 0 ? tariffScale(tariff) : '#555';
      });
  }

  function resizeMap() {
    const newWidth = mapContainer.offsetWidth;
    const newHeight = mapContainer.offsetHeight;
    svg.attr('width', newWidth).attr('height', newHeight).attr('viewBox', [0, 0, newWidth, newHeight]);
    projection.scale(newWidth / 5.5).translate([newWidth / 2, newHeight / 2]);
    svg.selectAll('.country').attr('d', path);
  }

  function handleClick(event, d) {
    if (!d.id) {
      d3.selectAll('.country').classed('selected', false);
      document.getElementById('info-panel').classList.add('hidden');
      svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
      return;
    }
    const alpha3 = window.numericToAlpha3[d.id];
    const countryName = window.countryCodeToName[alpha3];
    if (countryName && window.tariffData[countryName]) {
      updateCountryInfo(countryName, null);
      document.getElementById('info-panel').classList.remove('hidden');
      const country = svg.select(`#country-${d.id}`);
      if (!country.empty()) {
        d3.selectAll('.country').classed('selected', false);
        country.classed('selected', true);
        const bounds = path.bounds(d);
        const cx = (bounds[0][0] + bounds[1][0]) / 2;
        const cy = (bounds[0][1] + bounds[1][1]) / 2;
        const countryWidth = bounds[1][0] - bounds[0][0];
        const countryHeight = bounds[1][1] - bounds[0][1];
        let scale = Math.max(2, Math.min(12, 150 / Math.max(countryWidth, countryHeight)));
        
        // Calculate translation to center the country
        const translateX = width / 2 - scale * cx;
        const translateY = height / 2 - scale * cy;
  
        svg.transition()
          .duration(750)
          .call(zoom.transform, d3.zoomIdentity.translate(translateX, translateY).scale(scale));
      }
    }
  }

  // Load map data
  fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json', { cache: 'force-cache' })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      console.log("Map data loaded successfully");
      return response.json();
    })
    .then(data => {
      console.log("Processing map data...");
      const countries = topojson.feature(data, data.objects.countries).features;

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
          const alpha3 = window.numericToAlpha3[d.id];
          const countryName = window.countryCodeToName[alpha3];
          const hasTariff = countryName && window.tariffData[countryName];
          return hasTariff ? 'country has-tariff' : 'country no-data';
        })
        .style('fill', d => {
          const alpha3 = window.numericToAlpha3[d.id];
          const countryName = window.countryCodeToName[alpha3];
          const tariff = countryName && window.tariffData[countryName] ? getTariffValue(countryName, false) : null;
          return tariff != null && tariff > 0 ? tariffScale(tariff) : '#555';
        })
        .attr('data-alpha3', d => window.numericToAlpha3[d.id] || '')
        .attr('d', path)
        .attr('id', d => `country-${d.id}`)
        .attr('role', 'button')
        .attr('aria-label', d => window.countryCodeToName[window.numericToAlpha3[d.id]] || 'Unknown Country')
        .attr('tabindex', 0)
        .on('mouseover', (event, d) => ui.handleMouseOver(event, d))
        .on('mousemove', (event) => ui.handleMouseMove(event))
        .on('mouseout', () => ui.handleMouseOut())
        .on('click', (event, d) => handleClick(event, d))
        .on('keydown', (event, d) => {
          if (event.key === 'Enter' || event.key === ' ') {
            handleClick(event, d);
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

      window.addEventListener('resize', resizeMap);
    })
    .catch(error => {
      console.error('Error loading map data:', error);
      document.getElementById('loading').innerHTML = 'Error loading map. <button onclick="location.reload()">Retry</button>';
    });

  return { svg, path, tariffScale, zoom, updateMapColors, resizeMap, handleClick };
}
