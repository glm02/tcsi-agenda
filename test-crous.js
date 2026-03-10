fetch('http://webservices-v2.crous-mobile.fr:8080/feed/lyon/externe/resto.xml')
  .then(r => r.text())
  .then(t => {
    let match;
    const regex = /<resto[^>]*id="([^"]+)"[^>]*title="([^"]+)"/g;
    const items = [];
    while ((match = regex.exec(t)) !== null) {
      if (match[2].toLowerCase().includes('lyon') || match[2].toLowerCase().includes('quais') || match[2].toLowerCase().includes('manu') || match[2].toLowerCase().includes('doua') || match[2].toLowerCase().includes('puvis') || match[2].toLowerCase().includes('monod')) {
         items.push(`${match[1]}: ${match[2]}`);
      }
    }
    console.log(items.join('\n'));
  });
