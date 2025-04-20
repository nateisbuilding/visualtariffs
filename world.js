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

  initSidebar();
  populateOriginDropdown();
  initCalculator();

  // Consolidated resize handler with debounce
  window.addEventListener('resize', debounce(() => {
    const newWidth = mapContainer.offsetWidth;
    const newHeight = mapContainer.offsetHeight;
    console.log('Resized SVG dimensions: width=', newWidth, 'height=', newHeight);
    svg.attr('width', newWidth).attr('height', newHeight);
    map.resizeMap();
  }, 100));
});

function initSidebar() {
  const menuToggle = document.getElementById('menu-toggle');
  const controls = document.getElementById('controls');

  if (menuToggle && controls) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      controls.classList.toggle('hidden');
      // Ensure tariff buttons remain visible if in Tariff Rates mode
      const tariffWrapper = document.getElementById('tariff-slider-wrapper');
      if (tariffWrapper && !controls.classList.contains('hidden')) {
        tariffWrapper.classList.remove('hidden');
        tariffWrapper.style.display = 'flex';
      }
    });
  }
}

function populateOriginDropdown() {
  const originSelect = document.getElementById('origin-search');
  if (originSelect) {
    const countries = Object.keys(window.tariffData).sort();
    countries.forEach(country => {
      const option = document.createElement('option');
      option.value = country;
      option.textContent = country;
      originSelect.appendChild(option);
    });
  }
}

function initCalculator() {
  const calculateButton = document.getElementById('calculate-button');
  if (calculateButton) {
    calculateButton.addEventListener('click', () => {
      const origin = document.getElementById('origin-search').value;
      const goods = document.getElementById('goods-select').value;
      const steel = document.getElementById('steel-checkbox').checked;
      const aluminum = document.getElementById('aluminum-checkbox').checked;
      const quantity = parseInt(document.getElementById('quantity-input').value) || 0;
      const price = parseFloat(document.getElementById('price-input').value) || 0;

      if (origin && goods && quantity > 0 && price > 0) {
        const countryData = window.tariffData[origin];
        if (countryData) {
          let tariffRate = parseFloat(countryData.updated);
          if (steel && goods === 'Automobiles') tariffRate += 25;
          if (aluminum && goods === 'Automobiles') tariffRate += 10;

          const totalCost = quantity * price;
          const tariffCost = totalCost * (tariffRate / 100);
          const totalWithTariff = totalCost + tariffCost;

          document.getElementById('info-panel').innerHTML = `
            <div class="tariff-result">
              <p><span class="tariff-label">Origin:</span> ${origin}</p>
              <p><span class="tariff-label">Commodity:</span> ${goods}</p>
              <p><span class="tariff-label">Tariff Rate:</span> ${tariffRate}%</p>
              <p><span class="cost-label">Base Cost:</span> $${totalCost.toFixed(2)}</p>
              <p><span class="cost-label">Tariff Cost:</span> $${tariffCost.toFixed(2)}</p>
              <p><span class="cost-label">Total Cost:</span> $${totalWithTariff.toFixed(2)}</p>
            </div>
          `;
          document.getElementById('info-panel').classList.remove('hidden');
        } else {
          alert('No tariff data available for the selected country.');
        }
      } else {
        alert('Please fill in all fields with valid values.');
      }
    });
  }
}

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
