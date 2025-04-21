import { initNewsPanel } from './news.js';
import { curatedArticles } from './articles.js';

export function initMap(svg, width, height, tariffScale, updateLegend, { handleMouseOver, handleMouseMove, handleMouseOut, onCountryClick }) {
  let worldData = null;
  let selectedCountry = null;
  let isDragging = false;
  let currentArc = null;
  const currentYear = 2025;
  let displayMode = 'tariff-rates';
  let showPrevious = false;
  let isInitialCentering = true;

  const scaleFactor = Math.min(width, height) / 3.5;
  const projection = d3.geoOrthographic()
    .scale(scaleFactor)
    .translate([width / 2, height / 2])
    .clipAngle(90)
    .rotate([103.6296450709934, -44.74379504310722, 0]);

  const path = d3.geoPath().projection(projection);

  const sensitivity = 0.25;
  let rotation = [103.6296450709934, -44.74379504310722, 0];

  console.log('Initial projection rotation:', projection.rotate());
  console.log('Initial canvas: translate=', projection.translate(), 'scale=', projection.scale());

  const drag = d3.drag()
    .on('start', () => {
      if (!isInitialCentering) isDragging = true;
    })
    .on('drag', (event) => {
      if (!isInitialCentering) {
        const dx = event.dx * sensitivity;
        const dy = event.dy * sensitivity;
        rotation[0] += dx;
        rotation[1] -= dy;
        rotation[1] = Math.max(-90, Math.min(90, rotation[1]));
        projection.rotate(rotation);
        redraw();
      }
    })
    .on('end', () => {
      isDragging = false;
    });

  svg.call(drag);

  // Function to toggle legend visibility
  function toggleLegends(mode) {
    console.log('Toggling legends for mode:', mode);
    const isTariffRates = mode === 'tariff-rates';
    d3.select('#legend')
      .classed('hidden', !isTariffRates)
      .style('display', isTariffRates ? 'flex' : 'none');
    d3.select('#news-legend')
      .classed('hidden', isTariffRates)
      .style('display', isTariffRates ? 'none' : 'flex');
    d3.select('#tariff-button-wrapper')
      .classed('hidden', !isTariffRates)
      .style('display', isTariffRates ? 'flex' : 'none');
    console.log('Legend visibility:', {
      tariffLegendHidden: d3.select('#legend').classed('hidden'),
      tariffLegendDisplay: d3.select('#legend').style('display'),
      newsLegendHidden: d3.select('#news-legend').classed('hidden'),
      newsLegendDisplay: d3.select('#news-legend').style('display'),
      tariffButtonsHidden: d3.select('#tariff-button-wrapper').classed('hidden'),
      tariffButtonsDisplay: d3.select('#tariff-button-wrapper').style('display')
    });
  }

  const modeToggleContainer = d3.select('#mode-toggle-container');
  const modeToggle = modeToggleContainer.select('#mode-toggle');
  const toggleButtons = modeToggle.select('#mode-toggle-buttons');

  const modes = [
    { id: 'tariff-rates', value: 'tariff-rates', label: 'Tariff Rates' },
    { id: 'tariff-news', value: 'tariff-news', label: 'Tariff News' }
  ];

  toggleButtons.selectAll('.mode-button')
    .data(modes)
    .join('div')
    .attr('class', d => `mode-button ${d.value === displayMode ? 'active' : ''}`)
    .attr('id', d => `mode-${d.id}`)
    .attr('tabindex', 0)
    .attr('role', 'button')
    .attr('aria-label', d => `Switch to ${d.label} mode`)
    .text(d => d.label)
    .on('click', (event, d) => {
      console.log('Mode button clicked:', d.label);
      displayMode = d.value;
      d3.selectAll('.mode-button').classed('active', false);
      d3.select(`#mode-${d.id}`).classed('active', true);
      d3.select('#article-panel').classed('hidden', d.value === 'tariff-rates');
      toggleLegends(displayMode);
      updateMap();
      initNewsPanel(d.value === 'tariff-rates' ? selectedCountry : null, currentYear);
      updateLegend(showPrevious, displayMode);
    })
    .on('keydown', (event, d) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        console.log('Mode button keydown:', d.label);
        displayMode = d.value;
        d3.selectAll('.mode-button').classed('active', false);
        d3.select(`#mode-${d.id}`).classed('active', true);
        d3.select('#article-panel').classed('hidden', d.value === 'tariff-rates');
        toggleLegends(displayMode);
        updateMap();
        initNewsPanel(d.value === 'tariff-rates' ? selectedCountry : null, currentYear);
        updateLegend(showPrevious, displayMode);
      }
    });

  const controlsContainer = d3.select('.controls-container');
  const displayPane = controlsContainer.select('#display-pane');
  const tariffButtonWrapper = displayPane.select('#tariff-button-wrapper').empty()
    ? displayPane.append('div').attr('id', 'tariff-button-wrapper')
    : displayPane.select('#tariff-button-wrapper');

  function initializeTariffButtons() {
    console.log('Initializing tariff buttons');
    tariffButtonWrapper.selectAll('*').remove();
    const tariffButtons = [
        { id: 'past-rates', label: 'Past Rates', showPrevious: true, scale: [0, 50] },
        { id: 'current-rates', label: 'Current Rates', showPrevious: false, scale: [0, 145] }
    ];

    tariffButtonWrapper.selectAll('.tariff-button')
        .data(tariffButtons)
        .join('button')
        .attr('class', d => `tariff-button ${!d.showPrevious ? 'active' : ''}`)
        .attr('id', d => `tariff-${d.id}`)
        .text(d => d.label)
        .on('click', (event, d) => {
            showPrevious = d.showPrevious;
            console.log('Tariff button clicked:', d.label, 'showPrevious:', showPrevious, 'scale:', d.scale);
            d3.selectAll('.tariff-button').classed('active', false);
            d3.select(`#tariff-${d.id}`).classed('active', true);
            updateMapColors(d.scale);
            updateLegend(d.showPrevious, displayMode);
            updateMap();
            toggleLegends(displayMode); // Re-apply legend visibility
        });

    console.log('Tariff buttons created:', tariffButtonWrapper.selectAll('.tariff-button').size());
    toggleLegends(displayMode); // Set initial visibility
  }

  initializeTariffButtons();

  function getCentroid(countryName) {
    if (!worldData) {
      console.warn(`World data not loaded for ${countryName}`);
      return null;
    }
    const alpha3 = Object.keys(window.countryCodeToName).find(
      key => window.countryCodeToName[key].toLowerCase() === countryName.toLowerCase()
    );
    if (!alpha3) {
      console.warn(`No alpha3 code found for ${countryName}`);
      return null;
    }
    const numericId = Object.keys(window.numericToAlpha3).find(
      key => window.numericToAlpha3[key] === alpha3
    );
    if (!numericId) {
      console.warn(`No numeric ID for alpha3 ${alpha3}`);
      return null;
    }
    const feature = topojson.feature(worldData, worldData.objects.countries).features.find(
      f => f.id === numericId
    );
    if (!feature) {
      console.warn(`No feature found for numeric ID ${numericId}`);
      return null;
    }
    return d3.geoCentroid(feature);
  }

  function panAndZoomToCountry(countryName) {
    console.log('Panning to:', countryName);
    const centroid = getCentroid(countryName);
    if (!centroid) {
      console.warn(`Cannot pan to ${countryName}: Invalid centroid`);
      return;
    }

    const targetRotation = [-centroid[0], -centroid[1], 0];
    const targetScale = scaleFactor * 1.5;

    console.log(`Centering on ${countryName}: centroid=`, centroid, `targetRotation=`, targetRotation);

    const transition = svg.transition()
      .duration(1000)
      .tween('rotate', () => {
        const r = d3.interpolate(projection.rotate(), targetRotation);
        const s = d3.interpolate(projection.scale(), targetScale);
        return t => {
          projection.rotate(r(t)).scale(s(t));
          rotation = r(t);
          redraw();
        };
      })
      .on('end', () => {
        isInitialCentering = false;
        console.log('Centering complete: rotation=', projection.rotate(), 'scale=', projection.scale());
      });
  }

  function drawArc(action) {
    console.log('drawArc called with action:', action);
    if (currentArc) {
      svg.selectAll('.arc').remove();
      currentArc = null;
    }
    const { source, target, action: actionType, tariff_rate, product, impact } = action;
    const coord1 = getCentroid(source);
    const coord2 = getCentroid(target);
    if (!coord1 || !coord2) {
      console.warn(`Invalid coordinates: ${source} (${coord1}), ${target} (${coord2})`);
      return;
    }

    const arcGenerator = d3.geoInterpolate(coord1, coord2);
    const distance = d3.geoDistance(coord1, coord2);
    const altitude = 0.1 * distance;
    const points = d3.range(0, 1.01, 0.01).map(t => {
      const point = arcGenerator(t);
      const angle = Math.PI * t;
      const height = Math.sin(angle) * altitude;
      const scale = 1 + height;
      return [point[0], point[1], scale];
    });

    const lineGenerator = d3.line()
      .x(d => projection([d[0], d[1]])[0])
      .y(d => projection([d[0], d[1]])[1]);

    const arcPath = {
      type: 'LineString',
      coordinates: points.map(p => [p[0], p[1]])
    };

    currentArc = arcPath;
    const arcClass = actionType === 'retaliation' || actionType === 'tariff' ? 'retaliation' : actionType;
    const arc = svg.append('path')
      .datum(arcPath)
      .attr('class', `arc ${arcClass}`)
      .attr('d', lineGenerator(points))
      .style('fill', 'none')
      .attr('marker-end', `url(#arrowhead-${arcClass})`)
      .raise();

    arc.on('mouseover', (event) => {
      d3.select('#tooltip')
        .style('display', 'block')
        .style('opacity', 1)
        .style('left', `${event.pageX + 10}px`)
        .style('top', `${event.pageY - 10}px`)
        .html(`
          <strong>${source} → ${target}</strong><br>
          Action: ${actionType}<br>
          Tariff: ${tariff_rate}<br>
          Product: ${product}<br>
          Impact: ${impact}
        `);
    }).on('mouseout', () => {
      d3.select('#tooltip').style('opacity', 0).style('display', 'none');
    });

    [source, target].forEach(country => {
      document.dispatchEvent(new CustomEvent('updateCountryStatus', {
        detail: { country, status: actionType }
      }));
    });
  }

  function getCountryStatus(countryName) {
    const relevantArticles = curatedArticles.filter(article =>
      new Date(article.metadata.date).getFullYear() === currentYear &&
      (article.metadata.source.toLowerCase() === countryName.toLowerCase() ||
       article.metadata.target.toLowerCase() === countryName.toLowerCase())
    );
    if (!relevantArticles.length) return 'neutral';
    const latestArticle = relevantArticles.sort((a, b) =>
      new Date(b.metadata.date) - new Date(a.metadata.date)
    )[0];
    return latestArticle.metadata.action;
  }

  function updateMap() {
    console.log('Updating map for year:', currentYear, 'Mode:', displayMode, 'showPrevious:', showPrevious);
    const articlesInYear = curatedArticles.filter(
      article => new Date(article.metadata.date).getFullYear() === currentYear
    );
    console.log('Articles in year:', articlesInYear);
    svg.selectAll('.arc').remove();
    currentArc = null;

    svg.selectAll('.country').style('fill', d => {
      const alpha3 = window.numericToAlpha3[d.id];
      const countryName = window.countryCodeToName[alpha3];
      if (!countryName || !d.id) {
        console.warn(`No country name for ID ${d.id || 'undefined'}`);
        return '#555';
      }
      if (d.id === selectedCountry) {
        return '#FFFFFF';
      }
      if (countryName.toLowerCase() === 'united states') {
        return '#1E90FF';
      }
      if (displayMode === 'tariff-news') {
        const status = getCountryStatus(countryName);
        return countryName.toLowerCase() === 'canada' ? '#ffd54f' :
               countryName.toLowerCase() === 'china' ? '#e57373' :
               status === 'retaliation' || status === 'tariff' ? '#e57373' :
               status === 'compliance' ? '#81c784' :
               status === 'negotiation' ? '#ffd54f' : '#555';
      } else {
        const tariff = countryName && window.tariffData[countryName] ? getTariffValue(countryName, showPrevious) : null;
        console.log(`Country: ${countryName}, Tariff: ${tariff}, showPrevious: ${showPrevious}`);
        return tariff != null && tariff >= 0 ? tariffScale(tariff) : '#555';
      }
    });
  }

  function redraw() {
    svg.selectAll('.country').attr('d', path);
    svg.selectAll('.graticule').attr('d', path);
    svg.selectAll('.sphere')
      .attr('d', path)
      .style('opacity', projection.scale() > scaleFactor * 1.5 ? 0 : 1);
    if (currentArc) {
      const lineGenerator = d3.line()
        .x(d => projection([d[0], d[1]])[0])
        .y(d => projection([d[0], d[1]])[1]);
      svg.selectAll('.arc').attr('d', lineGenerator(currentArc.coordinates));
    }
  }

  function getTariffValue(countryName, showPrevious) {
    const data = window.tariffData[countryName];
    if (!data) {
      console.warn(`No tariff data for ${countryName}`);
      return null;
    }
    const rate = showPrevious ? data.previous : data.updated;
    const parsedRate = parseFloat(rate.replace('%', '')) || 0;
    console.log(`getTariffValue: ${countryName}, showPrevious: ${showPrevious}, rate: ${rate}, parsed: ${parsedRate}`);
    return parsedRate;
  }

  function updateMapColors(scale) {
    console.log('Updating map colors with scale:', scale, 'showPrevious:', showPrevious);
    tariffScale.domain(scale);
    if (displayMode !== 'tariff-rates') {
      console.warn('updateMapColors called in non-tariff-rates mode:', displayMode);
      return;
    }
    svg.selectAll('.country').style('fill', d => {
      const alpha3 = window.numericToAlpha3[d.id];
      const countryName = window.countryCodeToName[alpha3];
      if (!countryName) {
        console.warn(`No country name for ID ${d.id}`);
        return '#555';
      }
      if (countryName.toLowerCase() === 'united states') {
        return '#1E90FF';
      }
      if (d.id === selectedCountry) {
        return '#FFFFFF';
      }
      const tariff = countryName && window.tariffData[countryName] ? getTariffValue(countryName, showPrevious) : null;
      console.log(`Updating ${countryName}: Tariff=${tariff}, scale=${scale}`);
      return tariff != null && tariff >= 0 ? tariffScale(tariff) : '#555';
    });
  }

  function updateInfoPanel(countryName) {
    const infoPanel = d3.select('#info-panel');
    const data = window.tariffData[countryName];

    infoPanel.selectAll('*').remove();
    infoPanel.classed('hidden', false);

    const countryInfo = infoPanel.append('div').attr('class', 'country-info');
    countryInfo.append('div')
      .attr('class', 'country-name')
      .text(countryName === 'European Union' ? `${countryName} (Shared Tariff)` : countryName);

    if (data) {
      const previous = parseFloat(data.previous) || 0;
      const updated = parseFloat(data.updated) || 0;
      const difference = updated - previous;

      const tariffCard = countryInfo.append('div').attr('class', 'tariff-card');
      tariffCard.append('div').attr('class', 'tariff-label').text('Imports');
      tariffCard.append('div').attr('class', 'tariff-value').text(data.imports === 'NA' ? 'Not Available' : data.imports);

      const previousCard = countryInfo.append('div').attr('class', 'tariff-card');
      previousCard.append('div').attr('class', 'tariff-label').text('Previous Tariff');
      previousCard.append('div').attr('class', 'tariff-value').text(`${previous}%`);

      const updatedCard = countryInfo.append('div').attr('class', 'tariff-card');
      updatedCard.append('div').attr('class', 'tariff-label').text('Current Tariff');
      updatedCard.append('div').attr('class', 'tariff-value').text(`${updated}%`);

      const comparison = countryInfo.append('div').attr('class', 'comparison');
      if (difference > 0) {
        comparison.attr('class', 'comparison increase');
        comparison.html(`<span class="arrow">↑</span> Increased by ${difference}%`);
      } else if (difference < 0) {
        comparison.attr('class', 'comparison decrease');
        comparison.html(`<span class="arrow">↓</span> Decreased by ${Math.abs(difference)}%`);
      } else {
        comparison.attr('class', 'comparison no-change');
        comparison.html(`<span class="arrow">↔</span> No Change`);
      }
    } else {
      countryInfo.append('div')
        .attr('class', 'no-data')
        .text('No Tariff Data Available');
    }

    const newsPanel = countryInfo.append('div').attr('id', 'news-panel');
    newsPanel.append('h2').text('Trade Analysis');
    newsPanel.append('div').attr('id', 'news-articles');
    initNewsPanel(countryName, currentYear);
  }

  function resizeMap() {
    const mapContainer = document.getElementById('map-container');
    const newWidth = mapContainer.offsetWidth;
    const newHeight = mapContainer.offsetHeight;
    svg.attr('width', newWidth).attr('height', newHeight);
    projection.translate([newWidth / 2, newHeight / 2]).scale(Math.min(newWidth, newHeight) / 3.5 * 1.5);
    redraw();
  }

  function handleClick(event, d) {
    if (!d.id) {
      d3.selectAll('.country').classed('selected', false);
      document.getElementById('info-panel').classList.add('hidden');
      if (onCountryClick) {
        onCountryClick(null);
      }
      selectedCountry = null;
      svg.selectAll('.arc').remove();
      currentArc = null;
      updateMap();
      return;
    }
    const alpha3 = window.numericToAlpha3[d.id];
    const countryName = window.countryCodeToName[alpha3];
    if (countryName) {
      if (selectedCountry) {
        svg.selectAll('.country').classed('selected', false);
      }
      selectedCountry = d.id;
      d3.select(event.currentTarget).classed('selected', true);
      updateInfoPanel(countryName);
      panAndZoomToCountry(countryName);
      if (onCountryClick) {
        onCountryClick(countryName);
      }
      updateMap();
    }
  }

  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('view-on-map')) {
      console.log('View on Map clicked:', event.target.dataset.action);
      try {
        const action = JSON.parse(event.target.dataset.action);
        drawArc(action);
      } catch (e) {
        console.error('Error parsing action:', e);
      }
    }
  });

  document.addEventListener('updateCountryStatus', (event) => {
    const { country, status } = event.detail;
    console.log('Updating status for', country, ':', status);
    const alpha3 = Object.keys(window.countryCodeToName).find(
      key => window.countryCodeToName[key].toLowerCase() === country.toLowerCase()
    );
    if (!alpha3) {
      console.warn(`No alpha3 code for ${country}`);
      return;
    }
    const numericId = Object.keys(window.numericToAlpha3).find(
      key => window.numericToAlpha3[key] === alpha3
    );
    if (!numericId) {
      console.warn(`No numeric ID for alpha3 ${alpha3}`);
      return;
    }
    if (displayMode === 'tariff-news') {
      svg.select(`#country-${numericId}`).style('fill',
        country.toLowerCase() === 'united states' ? '#1E90FF' :
        country.toLowerCase() === 'canada' ? '#ffd54f' :
        country.toLowerCase() === 'china' ? '#e57373' :
        status === 'retaliation' || status === 'tariff' ? '#e57373' :
        status === 'compliance' ? '#81c784' :
        status === 'negotiation' ? '#ffd54f' : '#555'
      );
    }
  });

  const defs = svg.append('defs');
  ['retaliation', 'tariff', 'negotiation', 'compliance'].forEach(action => {
    defs.append('marker')
      .attr('id', `arrowhead-${action}`)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 5)
      .attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L10,0L0,4')
      .attr('fill', action === 'retaliation' || action === 'tariff' ? '#e57373' :
                    action === 'compliance' ? '#81c784' : '#ffd54f')
      .style('opacity', 0.9);
  });

  const filter = defs.append('filter')
    .attr('id', 'glow')
    .attr('x', '-20%')
    .attr('y', '-20%')
    .attr('width', '140%')
    .attr('height', '140%');
  filter.append('feDropShadow')
    .attr('dx', '0')
    .attr('dy', '0')
    .attr('stdDeviation', '1')
    .attr('flood-color', '#FFFFFF')
    .attr('flood-opacity', '0.5');

  const graticule = d3.geoGraticule();

  function loadMapData() {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json', { cache: 'force-cache' })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            console.log("Map data loaded successfully");
            return response.json();
        })
        .then(data => {
            worldData = data;
            const countries = topojson.feature(worldData, worldData.objects.countries).features;

            countries.forEach(feature => {
                if (!feature.geometry) {
                    console.warn(`Feature ID ${feature.id}: no geometry, skipping`);
                }
            });

            svg.append('path')
                .datum({ type: 'Sphere' })
                .attr('class', 'sphere')
                .attr('d', path)
                .style('fill', '#1a1a1a')
                .style('stroke', 'none');

            svg.append('path')
                .datum(graticule)
                .attr('class', 'graticule')
                .attr('d', path)
                .style('fill', 'none')
                .style('stroke', '#3a3a3a')
                .style('stroke-width', '0.5px');

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
                    return countryName && countryName.toLowerCase() === 'united states' ? '#1E90FF' :
                           tariff != null && tariff >= 0 ? tariffScale(tariff) : '#555';
                })
                .style('filter', d => {
                    const countryName = window.countryCodeToName[window.numericToAlpha3[d.id]];
                    const isUSA = countryName?.toLowerCase() === 'united states';
                    console.log(`Applying glow to ${countryName || 'unknown'}:`, isUSA ? 'url(#glow)' : 'none');
                    return isUSA ? 'url(#glow)' : null;
                })
                .style('shape-rendering', d => window.countryCodeToName[window.numericToAlpha3[d.id]]?.toLowerCase() === 'united states' ? 'crispEdges' : 'auto')
                .attr('data-alpha3', d => window.numericToAlpha3[d.id] || '')
                .attr('d', path)
                .attr('id', d => `country-${d.id}`)
                .attr('role', 'button')
                .attr('aria-label', d => window.countryCodeToName[window.numericToAlpha3[d.id]] || 'Unknown Country')
                .attr('tabindex', 0)
                .on('mouseover', (event, d) => {
                    if (!isDragging) handleMouseOver(event, d);
                })
                .on('mousemove', (event) => {
                    if (!isDragging) handleMouseMove(event);
                })
                .on('mouseout', () => {
                    if (!isDragging) handleMouseOut();
                })
                .on('click', handleClick)
                .on('keydown', (event, d) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        handleClick(event, d);
                    }
                });

            console.log(`Rendered ${countries.length} countries on the globe`);
            document.getElementById('loading').style.display = 'none';

            projection.scale(scaleFactor * 1.5);
            redraw();
            panAndZoomToCountry('United States');

            // Initialize legend visibility
            updateLegend(false, 'tariff-rates');
            toggleLegends('tariff-rates');
            console.log('Initial load visibility set to tariff-rates');
        })
        .catch(error => {
            console.error('Error loading map data:', error);
            document.getElementById('loading').innerHTML = 'Error loading map. <button onclick="location.reload()">Retry</button>';
        });
  }

  loadMapData();

  return { updateMapColors, resizeMap };
}
