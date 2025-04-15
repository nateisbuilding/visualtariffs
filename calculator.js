// calculator.js
export function initCalculator(handleSearch) {
    // Format numbers with commas
    function formatNumber(num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  
    // Update info panel with tariff calculation or country details
    function updateCountryInfo(countryName, tariffResult = null) {
      const infoPanel = document.getElementById('country-info');
  
      if (tariffResult) {
        const { origin, destination, item, quantity, price, tariffData, isSteel, isAluminum, goodsType } = tariffResult;
        let html = `<h2 class="country-name">${origin}</h2>`;
  
        if (!tariffData) {
          html += `<div class="no-data">No tariff data available for ${origin}</div>`;
          infoPanel.innerHTML = html;
          return;
        }
  
        const normalCost = quantity * price;
        const baseTariffRate = parseFloat(tariffData.updated.replace('%', '')) / 100;
        const steelAluminumTariff = (isSteel || isAluminum) ? 0.25 : 0;
        const autoTariff = goodsType === 'Automobiles' ? 0.25 : 0;
        const section301Tariff = origin === 'China' && ['Electronics', 'Clothing'].includes(goodsType) ? 0.15 : 0;
        const textileTariff = goodsType === 'Clothing' ? 0.15 : 0;
        const totalTariffRate = baseTariffRate + steelAluminumTariff + autoTariff + section301Tariff + textileTariff;
        const actualCost = normalCost * (1 + totalTariffRate);
  
        html += `
          <div class="tariff-result">
            <p><span class="tariff-label">Origin:</span> ${origin}</p>
            <p><span class="tariff-label">Destination:</span> ${destination}</p>
            <p><span class="tariff-label">Product:</span> ${item}</p>
            <p><span class="tariff-label">Quantity:</span> ${formatNumber(quantity)}</p>
            <p><span class="tariff-label">Price per Unit:</span> $${formatNumber(price.toFixed(2))}</p>
            <p><span class="tariff-label">Base Tariff Rate:</span> ${tariffData.updated}</p>
        `;
        if (isSteel || isAluminum) {
          html += `<p><span class="tariff-label">232 Tariff (Steel/Aluminum):</span> 25%</p>`;
        }
        if (goodsType === 'Automobiles') {
          html += `<p><span class="tariff-label">Automobile Tariff:</span> 25%</p>`;
        }
        if (section301Tariff > 0) {
          html += `<p><span class="tariff-label">Section 301 Tariff:</span> 15%</p>`;
        }
        if (textileTariff > 0) {
          html += `<p><span class="tariff-label">Textile Tariff:</span> 15%</p>`;
        }
        html += `
            <p><span class="tariff-label">Total Tariff Rate:</span> ${(totalTariffRate * 100).toFixed(1)}%</p>
            <p><span class="cost-label">Normal Cost:</span> $${formatNumber(normalCost.toFixed(2))}</p>
            <p><span class="cost-label">Actual Cost (with Tariffs):</span> $${formatNumber(actualCost.toFixed(2))}</p>
          </div>
        `;
        infoPanel.innerHTML = html;
        return;
      }
  
      const data = window.tariffData[countryName];
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
  
    // Set up calculate button
    const calculateButton = document.getElementById('calculate-button');
    if (calculateButton) {
      calculateButton.addEventListener('click', () => {
        const origin = document.getElementById('origin-search').value;
        const goodsType = document.getElementById('goods-select').value;
        const isSteel = document.getElementById('steel-checkbox').checked;
        const isAluminum = document.getElementById('aluminum-checkbox').checked;
        const quantity = parseFloat(document.getElementById('quantity-input').value);
        const price = parseFloat(document.getElementById('price-input').value);
  
        // Validation
        if (!origin || !window.tariffData[origin]) {
          alert('Please select a valid origin country.');
          return;
        }
        if (!goodsType) {
          alert('Please select a goods type.');
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
  
        // Construct item name
        let item = goodsType;
        if (isSteel && isAluminum) {
          item = `${goodsType} (Steel & Aluminum)`;
        } else if (isSteel) {
          item = `${goodsType} (Steel)`;
        } else if (isAluminum) {
          item = `${goodsType} (Aluminum)`;
        }
  
        const tariffResult = {
          origin,
          destination: 'United States',
          item,
          quantity,
          price,
          tariffData: window.tariffData[origin],
          isSteel,
          isAluminum,
          goodsType
        };
  
        handleSearch(origin, true, tariffResult);
      });
    }
  
    return { updateCountryInfo };
  }
