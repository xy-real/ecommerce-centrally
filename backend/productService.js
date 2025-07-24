import { supabase } from 'config/supabaseClient'; // your initialized Supabase client
import { v4 as uuidv4 } from 'uuid';

// Add a new product along with specs, images, and optional variants/highlights
export async function addProduct(productData) {
  const {
    product,
    specs = [],
    images = [],
    variants = [],
    highlights = []
  } = productData;

  const { data: productRes, error: productError } = await supabase
    .from('Products')
    .insert(product)
    .select()
    .single();

  if (productError) throw new Error(productError.message);

  const productID = productRes.ProductID;

  // Insert Product Specifications
  if (specs.length > 0) {
    const specValues = specs.map(spec => ({
      ProductID: productID,
      SpecID: spec.SpecID,
      Value: spec.Value
    }));

    const { error: specError } = await supabase
      .from('ProductSpecValues')
      .insert(specValues);
    if (specError) throw new Error(specError.message);
  }

  // Insert Images
  

  // Insert Variants (optional)
  if (variants.length > 0) {
    const variantData = variants.map(variant => ({
      ProductID: productID,
      ...variant
    }));

    const { error: variantError } = await supabase
      .from('ProductVariants')
      .insert(variantData);
    if (variantError) throw new Error(variantError.message);
  }

  // Insert Highlights (optional)
  if (highlights.length > 0) {
    const highlightData = highlights.map(text => ({
      ProductID: productID,
      BulletPoint: text
    }));

    const { error: highlightError } = await supabase
      .from('ProductHighlights')
      .insert(highlightData);
    if (highlightError) throw new Error(highlightError.message);
  }

  return productRes;
}

// Delete product by ID (cascades to child tables)
export async function deleteProduct(productID) {
  const { error } = await supabase
    .from('Products')
    .delete()
    .eq('ProductID', productID);

  if (error) throw new Error(error.message);
  return true;
}


// Upload a file to Supabase Storage and store its URL in the ProductImages table
export async function addPicture(productID, file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = `${productID}/${fileName}`;

  // 1. Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file);

  if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

  // 2. Get public URL
  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  const publicUrl = urlData.publicUrl;

  // 3. Insert into ProductImages table
  const { data: imageRow, error: dbError } = await supabase
    .from('ProductImages')
    .insert({
      ProductID: productID,
      ImageURL: publicUrl
    })
    .select()
    .single();

  if (dbError) throw new Error(`DB insert failed: ${dbError.message}`);

  return imageRow;
}

// Update product core fields only (not specs, variants, etc.)
export async function modifyProduct(productID, updateData) {
  updateData.UpdatedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from('Products')
    .update(updateData)
    .eq('ProductID', productID)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
