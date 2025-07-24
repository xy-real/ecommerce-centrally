import supabase  from '../backend/config/supabaseClient.js'; // your initialized Supabase client


// Access the parent container using class name
const productsGrid = document.getElementsByClassName('products-grid')[0];

// Sample function to create a single product card
function createProductCard() {
  const productCard = document.createElement('div');
  productCard.className = 'product-card';

  const link = document.createElement('a');
  link.href = 'PerformanceFolder/inv-mngmntMouse.html';

  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'product-image';

  const image = document.createElement('img');
  image.src = 'img/mouse.png';
  image.alt = 'Picture';
  imageWrapper.appendChild(image);

  const details = document.createElement('div');
  details.className = 'product-details';

  const name = document.createElement('div');
  name.className = 'product-name';
  name.textContent = 'Ergonomic Wireless Mouse';

  const category = document.createElement('div');
  category.className = 'product-category';
  category.textContent = 'Electronics';

  const price = document.createElement('div');
  price.className = 'product-price';
  price.textContent = '₱1,250.00';

  const units = document.createElement('div');
  units.className = 'product-units';
  units.textContent = '50 units in stock';

  const label = document.createElement('span');
  label.className = 'performance-label';
  label.textContent = 'Performance';

  const stats = document.createElement('div');
  stats.className = 'platform-stats';

  const platforms = [
    { name: 'Lazada', percentage: '0%', class: 'lazada' },
    { name: 'eBay', percentage: '0%', class: 'ebay' }
  ];

  platforms.forEach(platform => {
    const stat = document.createElement('div');
    stat.className = 'platform-stat';

    const indicator = document.createElement('span');
    indicator.className = `platform-indicator ${platform.class}`;

    const platformName = document.createElement('span');
    platformName.className = 'platform-name';
    platformName.textContent = platform.name;

    const percentage = document.createElement('span');
    percentage.className = 'platform-percentage';
    percentage.textContent = platform.percentage;

    stat.append(indicator, platformName, percentage);
    stats.appendChild(stat);
  });

  details.append(name, category, price, units, label, stats);
  link.append(imageWrapper, details);
  productCard.appendChild(link);

  return productCard;
}

// Generate and append 3 product cards
for (let i = 0; i < 3; i++) {
  console.log('Product card created');
  productsGrid.prepend(createProductCard());
}