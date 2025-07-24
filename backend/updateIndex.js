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

// ================================
// NEW DATABASE INTEGRATION SECTION
// ================================

// Function to get detailed product information from database
async function getProductDetails(productID) {
  try {
    // Get main product info with related data
    const { data: product, error: productError } = await supabase
      .from('products')
      .select(`
        *,
        sellers (name, storename, email),
        categories (name, level, platformid, platforms (name))
      `)
      .eq('productid', productID)
      .single();

    if (productError) throw new Error(`Product fetch failed: ${productError.message}`);

    // Get product images
    const { data: images, error: imagesError } = await supabase
      .from('productimages')
      .select('*')
      .eq('productid', productID)
      .order('sortorder');

    if (imagesError) throw new Error(`Images fetch failed: ${imagesError.message}`);

    // Get product variants
    const { data: variants, error: variantsError } = await supabase
      .from('productvariants')
      .select('*')
      .eq('productid', productID);

    if (variantsError) throw new Error(`Variants fetch failed: ${variantsError.message}`);

    // Get product highlights
    const { data: highlights, error: highlightsError } = await supabase
      .from('producthighlights')
      .select('*')
      .eq('productid', productID);

    if (highlightsError) throw new Error(`Highlights fetch failed: ${highlightsError.message}`);

    return {
      product,
      images,
      variants,
      highlights
    };
  } catch (error) {
    console.error('Error in getProductDetails:', error);
    throw error;
  }
}

// Function to get all products from database
async function getAllProducts(limit = 10) {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        productid,
        productname,
        description,
        baseprice,
        productstocks,
        brand,
        condition,
        createdat,
        sellers (name, storename),
        categories (name, level, platforms (name))
      `)
      .order('createdat', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Products fetch failed: ${error.message}`);

    return products;
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    throw error;
  }
}

// Function to create a product card from database data
async function createProductCardFromData(productData) {
  const productCard = document.createElement('div');
  productCard.className = 'product-card';
  productCard.setAttribute('data-product-id', productData.productid);

  const link = document.createElement('a');
  link.href = 'PerformanceFolder/inv-mngmntMouse.html';

  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'product-image';

  const image = document.createElement('img');
  
  // Get product image from productimages table
  try {
    const { data: images, error: imageError } = await supabase
      .from('productimages')
      .select('imageurl')
      .eq('productid', productData.productid)
      .order('sortorder')
      .limit(1);

    if (!imageError && images && images.length > 0) {
      image.src = images[0].imageurl;
    } else {
      // Use default fallback image if no image found
      image.src = 'img/mouse.png';
    }
  } catch (error) {
    console.warn(`⚠️ Could not load image for product ${productData.productname}:`, error);
    image.src = 'img/mouse.png'; // Fallback image
  }
  
  image.alt = productData.productname || 'Product Image';
  imageWrapper.appendChild(image);

  const details = document.createElement('div');
  details.className = 'product-details';

  const name = document.createElement('div');
  name.className = 'product-name';
  name.textContent = productData.productname || 'Unknown Product';

  const category = document.createElement('div');
  category.className = 'product-category';
  category.textContent = productData.categories?.name || 'Unknown Category';

  const price = document.createElement('div');
  price.className = 'product-price';
  price.textContent = `₱${(productData.baseprice || 0).toFixed(2)}`;

  const units = document.createElement('div');
  units.className = 'product-units';
  const stockCount = productData.productstocks || 0;
  const stockStatus = stockCount > 0 ? 'in stock' : 'out of stock';
  units.textContent = `${stockCount} units ${stockStatus}`;
  
  // Add visual indicator for stock status
  if (stockCount === 0) {
    units.style.color = '#e74c3c';
  } else if (stockCount < 10) {
    units.style.color = '#f39c12';
  } else {
    units.style.color = '#27ae60';
  }

  const label = document.createElement('span');
  label.className = 'performance-label';
  label.textContent = 'Performance';

  const stats = document.createElement('div');
  stats.className = 'platform-stats';

  // Get platform name from nested data
  const platformName = productData.categories?.platforms?.name || 'Unknown Platform';
  
  const platforms = [
    { name: platformName, percentage: '100%', class: 'lazada' },
    { name: 'Multi-Platform', percentage: '0%', class: 'ebay' }
  ];

  platforms.forEach(platform => {
    const stat = document.createElement('div');
    stat.className = 'platform-stat';

    const indicator = document.createElement('span');
    indicator.className = `platform-indicator ${platform.class}`;

    const platformNameSpan = document.createElement('span');
    platformNameSpan.className = 'platform-name';
    platformNameSpan.textContent = platform.name;

    const percentage = document.createElement('span');
    percentage.className = 'platform-percentage';
    percentage.textContent = platform.percentage;

    stat.append(indicator, platformNameSpan, percentage);
    stats.appendChild(stat);
  });

  details.append(name, category, price, units, label, stats);
  link.append(imageWrapper, details);
  productCard.appendChild(link);

  return productCard;
}

// Function to load and display all products from database
async function loadProductsFromDatabase() {
  try {
    console.log('🔄 Loading products from database...');
    
    // Get all products from database
    const products = await getAllProducts();
    
    console.log(`📦 Found ${products.length} products in database`);
    
    // Clear existing dummy cards (optional - you can remove this if you want to keep them)
    // productsGrid.innerHTML = '';
    
    // Create and append product cards from database
    for (const product of products) {
      console.log(`📋 Processing product: ${product.productname}`);
      
      try {
        // Get detailed product information
        const productDetails = await getProductDetails(product.productid);
        
        // Create product card with database data (now async to fetch images)
        const productCard = await createProductCardFromData(product);
        
        // Add the card to the grid
        productsGrid.appendChild(productCard);
        
        console.log(`✅ Added product card: ${product.productname}`);
        
        // Log detailed information for debugging
        console.log(`   💰 Price: ₱${product.baseprice}`);
        console.log(`   📦 Stock: ${product.productstocks} units`);
        console.log(`   🏷️  Category: ${product.categories?.name}`);
        console.log(`   🏪 Seller: ${product.sellers?.name}`);
        console.log(`   🌐 Platform: ${product.categories?.platforms?.name}`);
        
      } catch (detailError) {
        console.error(`❌ Error processing product ${product.productname}:`, detailError);
        // Still create a basic card even if details fail
        try {
          const basicCard = await createProductCardFromData(product);
          productsGrid.appendChild(basicCard);
        } catch (cardError) {
          console.error(`❌ Failed to create card for ${product.productname}:`, cardError);
        }
      }
    }
    
    console.log('🎉 All products loaded successfully!');
    
    return products;
    
  } catch (error) {
    console.error('❌ Error loading products from database:', error);
    throw error;
  }
}

// Function to refresh product data periodically
function startProductRefresh(intervalMinutes = 5) {
  console.log(`🔄 Starting automatic product refresh every ${intervalMinutes} minutes`);
  
  setInterval(async () => {
    try {
      console.log('🔄 Refreshing product data...');
      await loadProductsFromDatabase();
    } catch (error) {
      console.error('❌ Auto-refresh failed:', error);
    }
  }, intervalMinutes * 60 * 1000);
}

// Initialize database product loading when page loads
document.addEventListener('DOMContentLoaded', async function() {
  try {
    console.log('🚀 Page loaded, initializing database products...');
    
    // Load products from database
    await loadProductsFromDatabase();
    
    // Optional: Start automatic refresh
    // startProductRefresh(5); // Refresh every 5 minutes
    
  } catch (error) {
    console.error('❌ Failed to initialize database products:', error);
    console.log('💡 Using static product cards as fallback');
  }
});

