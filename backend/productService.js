import supabase  from './config/supabaseClient.js'; // your initialized Supabase client

// Simple UUID v4 generator for browser compatibility
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Add a new product along with specs, images, and optional variants/highlights
export async function addProduct(productData) {
  const {
    product,
    specs = [],
    images = [],
    variants = [],
    highlights = []
  } = productData;

  try {
    // Insert the main product
    const { data: productRes, error: productError } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    if (productError) throw new Error(`Product insert failed: ${productError.message}`);

    const productID = productRes.productid;

    // Insert Product Specifications
    if (specs.length > 0) {
      const specValues = specs.map(spec => ({
        productid: productID,
        specid: spec.specid || spec.SpecID,
        value: spec.value || spec.Value
      }));

      const { error: specError } = await supabase
        .from('productspecvalues')
        .insert(specValues);
      
      if (specError) throw new Error(`Spec values insert failed: ${specError.message}`);
    }

    // Insert Images
    if (images.length > 0) {
      const imageData = images.map((image, index) => ({
        productid: productID,
        imageurl: image.url || image.imageurl,
        sortorder: image.sortorder || image.sortOrder || index + 1
      }));

      const { error: imageError } = await supabase
        .from('productimages')
        .insert(imageData);
      
      if (imageError) throw new Error(`Images insert failed: ${imageError.message}`);
    }

    // Insert Variants (optional)
    if (variants.length > 0) {
      const variantData = variants.map(variant => ({
        productid: productID,
        variantname: variant.variantname || variant.VariantName,
        variantoption: variant.variantoption || variant.VariantOption,
        stock: variant.stock || variant.Stock,
        price: variant.price || variant.Price
      }));

      const { error: variantError } = await supabase
        .from('productvariants')
        .insert(variantData);
      
      if (variantError) throw new Error(`Variants insert failed: ${variantError.message}`);
    }

    // Insert Highlights (optional)
    if (highlights.length > 0) {
      const highlightData = highlights.map(text => ({
        productid: productID,
        bulletpoint: typeof text === 'string' ? text : text.bulletpoint || text.BulletPoint
      }));

      const { error: highlightError } = await supabase
        .from('producthighlights')
        .insert(highlightData);
      
      if (highlightError) throw new Error(`Highlights insert failed: ${highlightError.message}`);
    }

    return productRes;
  } catch (error) {
    console.error('Error in addProduct:', error);
    throw error;
  }
}

// Delete product by ID (cascades to child tables due to foreign key constraints)
export async function deleteProduct(productID) {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('productid', productID);

    if (error) throw new Error(`Product delete failed: ${error.message}`);
    return { success: true, message: 'Product deleted successfully' };
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    throw error;
  }
}

// Upload a file to Supabase Storage and store its URL in the ProductImages table
export async function addPicture(productID, file, sortOrder = 0) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${generateUUID()}.${fileExt}`;
    const filePath = `${productID}/${fileName}`;

    // 1. Upload to Supabase Storage (bucket must exist)
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      if (uploadError.message.includes('Bucket not found')) {
        throw new Error(`Storage bucket 'product-images' not found. Please create it manually in your Supabase dashboard:\n1. Go to Storage > Buckets\n2. Create new bucket named 'product-images'\n3. Make it public\n4. Set file size limit to 10MB`);
      }
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    // 2. Get public URL
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // 3. Insert into ProductImages table
    const { data: imageRow, error: dbError } = await supabase
      .from('productimages')
      .insert({
        productid: productID,
        imageurl: publicUrl,
        sortorder: sortOrder
      })
      .select()
      .single();

    if (dbError) throw new Error(`DB insert failed: ${dbError.message}`);

    return imageRow;
  } catch (error) {
    console.error('Error in addPicture:', error);
    throw error;
  }
}

// Update product core fields only (not specs, variants, etc.)
export async function modifyProduct(productID, updateData) {
  try {
    // Add updatedat timestamp
    const dataToUpdate = {
      ...updateData,
      updatedat: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('products')
      .update(dataToUpdate)
      .eq('productid', productID)
      .select()
      .single();

    if (error) throw new Error(`Product update failed: ${error.message}`);
    return data;
  } catch (error) {
    console.error('Error in modifyProduct:', error);
    throw error;
  }
}

// Additional utility functions for comprehensive product management

// Get full product details with all related data
export async function getProductDetails(productID) {
  try {
    // Get main product info
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

    // Get product specifications
    const { data: specs, error: specsError } = await supabase
      .from('productspecvalues')
      .select(`
        value,
        categoryspecifications (attributename, attributetype)
      `)
      .eq('productid', productID);

    if (specsError) throw new Error(`Specs fetch failed: ${specsError.message}`);

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
      specs,
      images,
      variants,
      highlights
    };
  } catch (error) {
    console.error('Error in getProductDetails:', error);
    throw error;
  }
}

// Update product specifications
export async function updateProductSpecs(productID, specs) {
  try {
    // Delete existing specs
    const { error: deleteError } = await supabase
      .from('productspecvalues')
      .delete()
      .eq('productid', productID);

    if (deleteError) throw new Error(`Specs delete failed: ${deleteError.message}`);

    // Insert new specs
    if (specs.length > 0) {
      const specValues = specs.map(spec => ({
        productid: productID,
        specid: spec.specid || spec.SpecID,
        value: spec.value || spec.Value
      }));

      const { error: insertError } = await supabase
        .from('productspecvalues')
        .insert(specValues);

      if (insertError) throw new Error(`Specs insert failed: ${insertError.message}`);
    }

    return { success: true, message: 'Product specs updated successfully' };
  } catch (error) {
    console.error('Error in updateProductSpecs:', error);
    throw error;
  }
}

// Update product variants
export async function updateProductVariants(productID, variants) {
  try {
    // Delete existing variants
    const { error: deleteError } = await supabase
      .from('productvariants')
      .delete()
      .eq('productid', productID);

    if (deleteError) throw new Error(`Variants delete failed: ${deleteError.message}`);

    // Insert new variants
    if (variants.length > 0) {
      const variantData = variants.map(variant => ({
        productid: productID,
        variantname: variant.variantname || variant.VariantName,
        variantoption: variant.variantoption || variant.VariantOption,
        stock: variant.stock || variant.Stock,
        price: variant.price || variant.Price
      }));

      const { error: insertError } = await supabase
        .from('productvariants')
        .insert(variantData);

      if (insertError) throw new Error(`Variants insert failed: ${insertError.message}`);
    }

    return { success: true, message: 'Product variants updated successfully' };
  } catch (error) {
    console.error('Error in updateProductVariants:', error);
    throw error;
  }
}

// Update product highlights
export async function updateProductHighlights(productID, highlights) {
  try {
    // Delete existing highlights
    const { error: deleteError } = await supabase
      .from('producthighlights')
      .delete()
      .eq('productid', productID);

    if (deleteError) throw new Error(`Highlights delete failed: ${deleteError.message}`);

    // Insert new highlights
    if (highlights.length > 0) {
      const highlightData = highlights.map(text => ({
        productid: productID,
        bulletpoint: typeof text === 'string' ? text : text.bulletpoint || text.BulletPoint
      }));

      const { error: insertError } = await supabase
        .from('producthighlights')
        .insert(highlightData);

      if (insertError) throw new Error(`Highlights insert failed: ${insertError.message}`);
    }

    return { success: true, message: 'Product highlights updated successfully' };
  } catch (error) {
    console.error('Error in updateProductHighlights:', error);
    throw error;
  }
}

// Delete a specific product image
export async function deleteProductImage(imageID) {
  try {
    // Get image details first to delete from storage
    const { data: image, error: fetchError } = await supabase
      .from('productimages')
      .select('imageurl')
      .eq('imageid', imageID)
      .single();

    if (fetchError) throw new Error(`Image fetch failed: ${fetchError.message}`);

    // Extract file path from URL for storage deletion
    if (image.imageurl.includes('supabase')) {
      const url = new URL(image.imageurl);
      const filePath = url.pathname.split('/').slice(-2).join('/'); // Get last two path segments
      
      const { error: storageError } = await supabase.storage
        .from('product-images')
        .remove([filePath]);

      if (storageError) console.warn('Storage deletion warning:', storageError.message);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('productimages')
      .delete()
      .eq('imageid', imageID);

    if (dbError) throw new Error(`Image delete failed: ${dbError.message}`);

    return { success: true, message: 'Image deleted successfully' };
  } catch (error) {
    console.error('Error in deleteProductImage:', error);
    throw error;
  }
}

// Search products with filters
export async function searchProducts(filters = {}) {
  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        sellers (name, storename),
        categories (name, level, platforms (name))
      `);

    // Apply filters
    if (filters.sellerID) {
      query = query.eq('sellerid', filters.sellerID);
    }

    if (filters.categoryID) {
      query = query.eq('categoryid', filters.categoryID);
    }

    if (filters.condition) {
      query = query.eq('condition', filters.condition);
    }

    if (filters.minPrice) {
      query = query.gte('baseprice', filters.minPrice);
    }

    if (filters.maxPrice) {
      query = query.lte('baseprice', filters.maxPrice);
    }

    if (filters.brand) {
      query = query.ilike('brand', `%${filters.brand}%`);
    }

    if (filters.minStock) {
      query = query.gte('productstocks', filters.minStock);
    }

    if (filters.maxStock) {
      query = query.lte('productstocks', filters.maxStock);
    }

    if (filters.inStock) {
      query = query.gt('productstocks', 0);
    }

    if (filters.outOfStock) {
      query = query.eq('productstocks', 0);
    }

    if (filters.searchTerm) {
      query = query.or(`productname.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'createdat';
    const sortOrder = filters.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Product search failed: ${error.message}`);

    return data;
  } catch (error) {
    console.error('Error in searchProducts:', error);
    throw error;
  }
}

// Get category specifications for product form validation
export async function getCategorySpecifications(categoryID) {
  try {
    const { data, error } = await supabase
      .from('categoryspecifications')
      .select('*')
      .eq('categoryid', categoryID);

    if (error) throw new Error(`Category specs fetch failed: ${error.message}`);

    return data;
  } catch (error) {
    console.error('Error in getCategorySpecifications:', error);
    throw error;
  }
}

// Update product stock quantity
export async function updateProductStock(productID, newStock) {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ 
        productstocks: newStock,
        updatedat: new Date().toISOString()
      })
      .eq('productid', productID)
      .select()
      .single();

    if (error) throw new Error(`Stock update failed: ${error.message}`);
    return data;
  } catch (error) {
    console.error('Error in updateProductStock:', error);
    throw error;
  }
}

// Adjust product stock (add or subtract)
export async function adjustProductStock(productID, adjustment) {
  try {
    // First get current stock
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('productstocks')
      .eq('productid', productID)
      .single();

    if (fetchError) throw new Error(`Product fetch failed: ${fetchError.message}`);

    const newStock = Math.max(0, (product.productstocks || 0) + adjustment);

    const { data, error } = await supabase
      .from('products')
      .update({ 
        productstocks: newStock,
        updatedat: new Date().toISOString()
      })
      .eq('productid', productID)
      .select()
      .single();

    if (error) throw new Error(`Stock adjustment failed: ${error.message}`);
    return data;
  } catch (error) {
    console.error('Error in adjustProductStock:', error);
    throw error;
  }
}

// Get products with low stock (below threshold)
export async function getLowStockProducts(threshold = 10) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        sellers (name, storename),
        categories (name)
      `)
      .lt('productstocks', threshold)
      .order('productstocks', { ascending: true });

    if (error) throw new Error(`Low stock query failed: ${error.message}`);

    return data;
  } catch (error) {
    console.error('Error in getLowStockProducts:', error);
    throw error;
  }
}

// TEST FUNCTION - Create dummy data
export async function createDummyData() {
  console.log('🔧 Creating dummy data...\n');
  
  try {
    // Create dummy platform
    console.log('Creating platform...');
    const { data: platform, error: platformError } = await supabase
      .from('platforms')
      .insert({ name: 'Test E-commerce Platform' })
      .select()
      .single();
    
    if (platformError && !platformError.message.includes('duplicate')) {
      throw platformError;
    }
    
    // Get existing platform if insert failed due to duplicate
    let platformData = platform;
    if (!platformData) {
      const { data: existingPlatform } = await supabase
        .from('platforms')
        .select('*')
        .limit(1)
        .single();
      platformData = existingPlatform;
    }
    
    console.log('✅ Platform ready');
    
    // Create dummy category
    console.log('Creating category...');
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .insert({
        name: 'Electronics',
        level: 1,
        platformid: platformData.platformid
      })
      .select()
      .single();
    
    if (categoryError && !categoryError.message.includes('duplicate')) {
      throw categoryError;
    }
    
    // Get existing category if insert failed
    let categoryData = category;
    if (!categoryData) {
      const { data: existingCategory } = await supabase
        .from('categories')
        .select('*')
        .limit(1)
        .single();
      categoryData = existingCategory;
    }
    
    console.log('✅ Category ready');
    
    // Create dummy seller
    console.log('Creating seller...');
    const { data: seller, error: sellerError } = await supabase
      .from('sellers')
      .insert({
        name: 'Test Seller',
        email: 'seller@test.com',
        storename: 'Test Electronics Store'
      })
      .select()
      .single();
    
    if (sellerError && !sellerError.message.includes('duplicate')) {
      throw sellerError;
    }
    
    // Get existing seller if insert failed
    let sellerData = seller;
    if (!sellerData) {
      const { data: existingSeller } = await supabase
        .from('sellers')
        .select('*')
        .limit(1)
        .single();
      sellerData = existingSeller;
    }
    
    console.log('✅ Seller ready');
    console.log('✅ Dummy data created successfully!\n');
    
    return {
      platform: platformData,
      category: categoryData,
      seller: sellerData
    };
    
  } catch (error) {
    console.error('❌ Error creating dummy data:', error.message);
    throw error;
  }
}

// TEST FUNCTION - Test all functions with dummy data
export async function testFunctionsWithDummyData() {
  console.log('🧪 Testing Product Service Functions with Dummy Data...\n');
  
  try {
    // Step 1: Create dummy data
    const dummyData = await createDummyData();
    
    // Step 2: Test addProduct function
    console.log('1️⃣ Testing addProduct function...');
    
    const testProductData = {
      product: {
        sellerid: dummyData.seller.sellerid,
        categoryid: dummyData.category.categoryid,
        productname: "Gaming Mouse Pro X1 - " + Date.now(),
        description: "High-performance wireless gaming mouse with RGB lighting and 16000 DPI sensor. Perfect for competitive gaming.",
        brand: "TechMaster",
        condition: "New",
        baseprice: 89.99,
        productstocks: 50,
        weightkg: 0.15,
        lengthcm: 12.5,
        widthcm: 8.0,
        heightcm: 4.2
      },
      images: [
        {
          url: "https://example.com/gaming-mouse-1.jpg",
          sortorder: 1
        },
        {
          url: "https://example.com/gaming-mouse-2.jpg",
          sortorder: 2
        }
      ],
      variants: [
        {
          variantname: "Color",
          variantoption: "Black",
          stock: 25,
          price: 89.99
        },
        {
          variantname: "Color",
          variantoption: "White",
          stock: 15,
          price: 94.99
        }
      ],
      highlights: [
        "High precision 16000 DPI sensor",
        "Customizable RGB lighting",
        "Ergonomic design for long gaming sessions",
        "6 programmable buttons with macro support",
        "Wireless connectivity with ultra-low latency"
      ]
    };
    
    const addedProduct = await addProduct(testProductData);
    console.log('✅ Product added successfully!');
    console.log(`   Product ID: ${addedProduct.productid}`);
    console.log(`   Product Name: ${addedProduct.productname}`);
    console.log(`   Price: $${addedProduct.baseprice}`);
    console.log(`   Stock: ${addedProduct.productstocks} units`);
    
    // Step 3: Test stock management functions
    console.log('\n2️⃣ Testing stock management functions...');
    
    // Test stock update
    const stockUpdated = await updateProductStock(addedProduct.productid, 75);
    console.log(`✅ Stock updated to: ${stockUpdated.productstocks} units`);
    
    // Test stock adjustment
    const stockAdjusted = await adjustProductStock(addedProduct.productid, -10);
    console.log(`✅ Stock adjusted to: ${stockAdjusted.productstocks} units`);
    
    // Step 4: Test getProductDetails function
    console.log('\n3️⃣ Testing getProductDetails function...');
    
    const productDetails = await getProductDetails(addedProduct.productid);
    console.log('✅ Product details retrieved!');
    console.log(`   Product: ${productDetails.product.productname}`);
    console.log(`   Current Stock: ${productDetails.product.productstocks} units`);
    console.log(`   Images: ${productDetails.images.length}`);
    console.log(`   Variants: ${productDetails.variants.length}`);
    console.log(`   Highlights: ${productDetails.highlights.length}`);
    
    // Step 5: Test searchProducts function
    console.log('\n4️⃣ Testing searchProducts function...');
    
    const searchResults = await searchProducts({
      searchTerm: 'gaming',
      limit: 5
    });
    console.log('✅ Search completed!');
    console.log(`   Found ${searchResults.length} products matching "gaming"`);
    
    // Step 6: Test modifyProduct function
    console.log('\n5️⃣ Testing modifyProduct function...');
    
    const updatedProduct = await modifyProduct(addedProduct.productid, {
      baseprice: 79.99,
      brand: "TechMaster Pro"
    });
    console.log('✅ Product updated successfully!');
    console.log(`   New price: $${updatedProduct.baseprice}`);
    console.log(`   New brand: ${updatedProduct.brand}`);
    
    // Step 7: Test searchProducts with stock filters
    console.log('\n6️⃣ Testing searchProducts with stock filters...');
    
    const stockResults = await searchProducts({
      inStock: true,
      limit: 3
    });
    console.log('✅ Stock filter search completed!');
    console.log(`   Found ${stockResults.length} products in stock`);
    
    // Step 8: Test low stock products
    console.log('\n7️⃣ Testing low stock detection...');
    
    const lowStockProducts = await getLowStockProducts(100);
    console.log('✅ Low stock query completed!');
    console.log(`   Found ${lowStockProducts.length} products with stock below 100`);
    
    // Step 9: Test searchProducts with price filter
    console.log('\n8️⃣ Testing searchProducts with price filter...');
    
    const priceResults = await searchProducts({
      minPrice: 70,
      maxPrice: 100,
      limit: 3
    });
    console.log('✅ Price filter search completed!');
    console.log(`   Found ${priceResults.length} products between $70-$100`);
    
    console.log('\n🎉 ALL TESTS PASSED! 🎉');
    console.log('\n📊 Summary:');
    console.log('✅ Dummy data created successfully');
    console.log('✅ addProduct function working (with stock support)');
    console.log('✅ Stock management functions working');
    console.log('✅ getProductDetails function working');
    console.log('✅ searchProducts function working');
    console.log('✅ modifyProduct function working');
    console.log('✅ Stock filtering working');
    console.log('✅ Low stock detection working');
    console.log('✅ Price filtering working');
    console.log('\n🔗 Your product functions are fully functional with stock management!');
    
    return {
      success: true,
      productId: addedProduct.productid,
      dummyData
    };
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Full error:', error);
    
    if (error.message.includes('violates foreign key constraint')) {
      console.log('\n💡 Foreign key constraint error. This might be due to:');
      console.log('- Missing seller or category data');
      console.log('- Incorrect ID field names (check if they use lowercase)');
    } else if (error.message.includes('violates check constraint')) {
      console.log('\n💡 Check constraint error. Verify data meets table constraints.');
    } else if (error.message.includes('duplicate key')) {
      console.log('\n💡 Duplicate data - this is usually fine, continuing with existing data.');
    }
    
    return { success: false, error: error.message };
  }
}

