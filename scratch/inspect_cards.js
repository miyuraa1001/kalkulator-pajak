const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const cardRegex = /<div class="kpi-card-3d[^"]*"[\s\S]*?(?=(?:<div class="kpi-card-3d|<footer|<\/main|$))/g;
let match;
let count = 0;
while ((match = cardRegex.exec(content)) !== null) {
  count++;
  const cardHtml = match[0];
  const title = (cardHtml.match(/<h3[^>]*>([\s\S]*?)<\/h3>/) || [])[1] || 'Unknown';
  console.log(`\nCard ${count}: ${title.replace(/&amp;/g, '&').trim()}`);
  
  const imgs = [...cardHtml.matchAll(/<img[^>]+src="([^">]+)"[^>]*>/g)];
  imgs.forEach(img => {
    const src = img[1];
    const alt = (img[0].match(/alt="([^">]+)"/) || [])[1] || '';
    const cls = (img[0].match(/class="([^">]+)"/) || [])[1] || '';
    console.log(`  - [${alt}] ${src} | class="${cls}"`);
  });
}

