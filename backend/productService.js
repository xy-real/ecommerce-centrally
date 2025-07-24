// Import Supabase client (assumed initialized elsewhere)
import { supabase } from 'config/supabaseClient.js'; // Adjust path as needed

// ✅ Add a new product
export async function addProduct(productData) {
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select();

  if (error) {
    console.error('Error adding product:', error.message);
    return null;
  }

  console.log('Product added:', data[0]);
  return data[0];
}

// ✏️ Update a product by ID
export async function updateProduct(productId, updates) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('product_id', productId)
    .select();

  if (error) {
    console.error('Error updating product:', error.message);
    return null;
  }

  console.log('Product updated:', data[0]);
  return data[0];
}

// 🗑️ Delete a product by ID
export async function deleteProduct(productId) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('product_id', productId);

  if (error) {
    console.error('Error deleting product:', error.message);
    return false;
  }

  console.log('Product deleted:', productId);
  return true;
}
