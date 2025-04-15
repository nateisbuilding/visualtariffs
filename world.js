import { initCalculator } from './calculator.js';
import { initMap } from './map.js';
import { initUI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM fully loaded, initializing...");

  if (!document.getElementById('map-container')) return;

    let showPrevious = false;

  // Initialize calculator first to get updateCountryInfo
  const { updateCountryInfo } = initCalculator((countryName, isCalculate, tariffResult) => {
    handleSearch(countryName, isCalculate, tariffResult);
  });

  // Initialize map, passing updateCountryInfo
  const { svg, path, tariffScale, zoom, updateMapColors, resizeMap, handleClick } = initMap(updateCountryInfo);

  // Initialize UI, excluding updateLegend
  const { handleMouseOver, handleMouseMove, handleMouseOut } = initUI(svg, tariffScale);

  // Custom updateLegend function
  function updateLegend(showPrevious) {
    const legend = d3.select('#legend');
    
    // Remove dynamic legend content, preserve #tariff-slider-wrapper
    legend.select('.legend-content').remove();
    
    // Insert legend-content before tariff-slider-wrapper
    const legendContent = legend.insert('div', '#tariff-slider-wrapper')
      .attr('class', 'legend-content');
    
    // Add title
    legendContent.append('div')
      .attr('class', 'legend-title')
      .text(showPrevious ? 'Previous Tariff Rates' : 'Current Tariff Rates');
    
    // Debug tariffScale
    console.log('tariffScale values:', {
      low: tariffScale(10),
      high: tariffScale(showPrevious ? 50 : 145)
    });
    
    // Add gradient bar
    const gradientItem = legendContent.append('div')
      .attr('class', 'legend-item');
    gradientItem.append('span')
      .attr('class', 'legend-color gradient')
      .style('background', `linear-gradient(to right, ${tariffScale(10)}, ${tariffScale(showPrevious ? 50 : 145)})`);
    gradientItem.append('span')
      .text(showPrevious ? '10% - 50%' : '10% - 145%');
    
    // Add low-end label (10%)
    const lowItem = legendContent.append('div')
      .attr('class', 'legend-item');
    lowItem.append('span')
      .attr('class', 'legend-color low')
      .style('background-color', tariffScale(10));
    lowItem.append('span')
      .text('10%');
    
    // Add high-end label
    const highItem = legendContent.append('div')
      .attr('class', 'legend-item');
    highItem.append('span')
      .attr('class', 'legend-color high')
      .style('background-color', tariffScale(showPrevious ? 50 : 145));
    highItem.append('span')
      .text(showPrevious ? '50%' : '145%');
    
    // Add "No tariff data" item
    const noDataItem = legendContent.append('div')
      .attr('class', 'legend-item no-data');
    noDataItem.append('span')
      .attr('class', 'legend-color')
      .style('background-color', '#555');
    noDataItem.append('span')
      .text('No tariff data');
    
    // Debug DOM structure
    console.log('Legend HTML:', legend.node().outerHTML);
  }

  // Initialize hamburger menu
  const menuToggle = document.getElementById('menu-toggle');
  const controls = document.getElementById('controls');
  
  if (menuToggle && controls) {
    menuToggle.addEventListener('click', () => {
      console.log('Menu toggle clicked');
      menuToggle.classList.toggle('active');
      controls.classList.toggle('hidden');
    });
  }

  // Handle search/calculate
  function handleSearch(countryName, isCalculate, tariffResult) {
    if (!countryName || !window.tariffData[countryName]) return;

    const alpha3 = Object.keys(window.countryCodeToName).find(code => window.countryCodeToName[code] === countryName);
    const numericId = Object.keys(window.numericToAlpha3).find(key => window.numericToAlpha3[key] === alpha3);
        const country = svg.select(`#country-${numericId}`);
        if (!country.empty()) {
            d3.selectAll('.country').classed('selected', false);
            country.classed('selected', true);
            const bounds = path.bounds(country.datum());
            const cx = (bounds[0][0] + bounds[1][0]) / 2;
            const cy = (bounds[0][1] + bounds[1][1]) / 2;
            let scale = Math.max(2, Math.min(12, 150 / Math.max(bounds[1][0] - bounds[0][0], bounds[1][1] - bounds[0][1])));
      if (numericId === '554' || numericId === '242') { // New Zealand, Fiji
                scale = 5;
                const lon = numericId === '554' ? 174 : 179;
                const lat = numericId === '554' ? -42 : -18;
        const projected = d3.geoMercator().center([lon, lat]).scale(scale * 100).translate([0, 0])([lon, lat]);
                svg.transition()
                    .duration(750)
          .call(zoom.transform, d3.zoomIdentity.translate(window.innerWidth / 2 - scale * projected[0], window.innerHeight / 2 - scale * projected[1]).scale(scale));
            } else {
        const translate = [window.innerWidth / 2 - scale * cx, window.innerHeight / 2 - scale * cy];
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

  // Populate origin search
  const originSearch = document.getElementById('origin-search');
  if (originSearch) {
    const countryNames = Object.keys(window.tariffData).filter(name => name !== 'United States').sort();
    countryNames.forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      originSearch.appendChild(option);
    });
    originSearch.addEventListener('change', (event) => {
      handleSearch(event.target.value, false, null);
    });
  }

  // Tariff slider
  const tariffSlider = document.getElementById('tariff-slider');
  if (tariffSlider) {
    tariffSlider.addEventListener('input', () => {
      showPrevious = tariffSlider.value === '0';
      updateMapColors(showPrevious);
      updateLegend(showPrevious);
    });
  }

  // Initial legend update
  updateLegend(showPrevious);
});
