import supabase from './config/supabaseClient.js';

async function setupStorage() {
  console.log('🔧 Setting up Supabase Storage...');
  
  try {
    // Create the product-images bucket
    const { data, error } = await supabase.storage.createBucket('product-images', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      fileSizeLimit: 1024 * 1024 * 10 // 10MB limit
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Bucket "product-images" already exists');
      } else {
        throw error;
      }
    } else {
      console.log('✅ Bucket "product-images" created successfully');
    }

    // Test bucket access
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw listError;
    }

    const productImagesBucket = buckets.find(bucket => bucket.name === 'product-images');
    if (productImagesBucket) {
      console.log('✅ Storage setup complete!');
      console.log(`   Bucket ID: ${productImagesBucket.id}`);
      console.log(`   Public: ${productImagesBucket.public}`);
    } else {
      console.log('⚠️  Bucket not found in list, but this might be normal');
    }

  } catch (error) {
    console.error('❌ Storage setup failed:', error.message);
    console.error('Full error:', error);
    
    if (error.message.includes('permission')) {
      console.log('\n💡 Permission error. You may need to:');
      console.log('1. Check your Supabase service role key');
      console.log('2. Enable storage in your Supabase project');
      console.log('3. Create the bucket manually in Supabase dashboard');
    }
  }
}

setupStorage();
