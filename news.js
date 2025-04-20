import { curatedArticles } from './articles.js';

export function initNewsPanel(countryName = null, year = 2025) {
  console.log('initNewsPanel called with country:', countryName, 'year:', year);
  console.log('Curated articles:', curatedArticles);

  const newsPanel = d3.select('#news-articles');
  if (newsPanel.empty()) {
    console.error('News panel not found');
    return;
  }

  newsPanel.html('<p>Loading articles...</p>');

  function getCountryStatus(country) {
    const relevantArticles = curatedArticles.filter(article =>
      new Date(article.metadata.date).getFullYear() === year &&
      (article.metadata.source.toLowerCase() === country.toLowerCase() ||
       article.metadata.target.toLowerCase() === country.toLowerCase())
    );
    if (!relevantArticles.length) return 'neutral';
    const latestArticle = relevantArticles.sort((a, b) =>
      new Date(b.metadata.date) - new Date(a.metadata.date)
    )[0];
    return latestArticle.metadata.action;
  }

  newsPanel.html('');
  let filteredArticles = curatedArticles.filter(article =>
    new Date(article.metadata.date).getFullYear() === year
  );
  if (countryName && countryName !== 'United States') {
    filteredArticles = filteredArticles.filter(article =>
      article.metadata.source.toLowerCase() === countryName.toLowerCase() ||
      article.metadata.target.toLowerCase() === countryName.toLowerCase()
    );
    console.log('Filtered articles for', countryName, ':', filteredArticles);
  }

  if (filteredArticles.length > 0) {
    newsPanel.selectAll('.news-article')
      .data(filteredArticles.slice(0, 5))
      .enter()
      .append('div')
      .attr('class', 'news-article')
      .html(d => `
        <h3>${d.title}</h3>
        <p>${d.content}</p>
        <p class="source">Curated Analysis - ${new Date(d.metadata.date).toLocaleDateString()}</p>
      `);

    if (countryName) {
      const status = getCountryStatus(countryName);
      console.log('Country status for', countryName, ':', status);
      document.dispatchEvent(new CustomEvent('updateCountryStatus', {
        detail: { country: countryName, status }
      }));
    }
  } else {
    newsPanel.html('<p>No relevant articles found.</p>');
  }
}
