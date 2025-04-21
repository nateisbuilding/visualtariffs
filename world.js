import { initMap } from './map.js';
import { initUI } from './ui.js';
import { initNewsPanel } from './news.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  const mapContainer = document.getElementById('map-container');
  const width = mapContainer.offsetWidth;
  const height = mapContainer.offsetHeight;
  console.log('Initial SVG dimensions: width=', width, 'height=', height);

  const svg = d3.select('#map-container')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const tariffScale = d3.scaleLinear()
    .domain([0, 145])
    .range(['#FFFACD', '#B22222'])
    .clamp(true);

  const previousTariffScale = d3.scaleLinear()
    .domain([0, 50])
    .range(['#FFFACD', '#B22222'])
    .clamp(true);

  const { handleMouseOver, handleMouseMove, handleMouseOut, updateLegend } = initUI(svg, tariffScale, previousTariffScale);

  const map = initMap(svg, width, height, tariffScale, updateLegend, {
    handleMouseOver,
    handleMouseMove,
    handleMouseOut,
    onCountryClick: (countryName) => {
      initNewsPanel(countryName);
    }
  });

  // Consolidated resize handler with debounce
  window.addEventListener('resize', debounce(() => {
    const newWidth = mapContainer.offsetWidth;
    const newHeight = mapContainer.offsetHeight;
    console.log('Resized SVG dimensions: width=', newWidth, 'height=', newHeight);
    svg.attr('width', newWidth).attr('height', newHeight);
    map.resizeMap();
  }, 100));
});

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
