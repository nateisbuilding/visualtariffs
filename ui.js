export function initUI(svg, tariffScale) {
    let tooltipTimeout = null;
  
    function handleMouseOver(event, d) {
      if (window.innerWidth <= 768) return;
      clearTimeout(tooltipTimeout);
      const alpha3 = window.numericToAlpha3[d.id];
      const countryName = window.countryCodeToName[alpha3];
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
      tooltipTimeout = setTimeout(hideTooltip, 100);
    }
  
    function showTooltip(event, countryName) {
      const tooltip = document.getElementById('tooltip');
      const data = window.tariffData[countryName];
      tooltip.innerHTML = data
        ? `${countryName === 'European Union' ? `${countryName} (Shared Tariff)` : countryName}<br>Imports: ${data.imports === 'NA' ? 'Not Available' : data.imports}<br>Previous: ${data.previous}<br>Updated: ${data.updated}`
        : `${countryName}<br>No Tariff Data`;
      tooltip.style.display = 'block';
      tooltip.style.opacity = '0';
      tooltip.style.position = 'absolute';
      tooltip.style.zIndex = '1001';
      tooltip.classList.add('visible');
      tooltip.offsetHeight;
      tooltip.style.opacity = '1';
      updateTooltipPosition(event);
    }
  
    function updateTooltipPosition(event) {
      const tooltip = document.getElementById('tooltip');
      const tooltipRect = tooltip.getBoundingClientRect();
      let left = event.pageX + 10;
      let top = event.pageY + 10;
  
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
  
    function updateLegend(showPrevious) {
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
  
    // Initialize hamburger menu
    const menuToggle = document.getElementById('menu-toggle');
    const controls = document.getElementById('controls');
    
    if (menuToggle && controls) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            controls.classList.toggle('hidden');
        });
    }
  
    return { updateLegend, handleMouseOver, handleMouseMove, handleMouseOut };
  }
