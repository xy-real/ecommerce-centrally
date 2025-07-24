import supabase  from '../backend/config/supabaseClient.js'; // your initialized Supabase client
import { addProduct, addPicture } from './productService.js'; // Import the product functions
 
console.log("This is javascript");

// Direct button click event listener
 function attachButtonListener() {
    const createButton = document.querySelector('.create-product-btn');
    
    if (createButton) {
        createButton.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default form submission
            
            // Capture all form inputs into local variables
            
            // Product Details
            const productName = document.getElementById('product-name').value.trim();
            const productImage = document.getElementById('product-image').files[0]; // File object
            const productDescription = document.getElementById('product-description').value.trim();
            const price = parseFloat(document.getElementById('price').value) || 0;
            const category = document.getElementById('category').value;
            const stock = parseInt(document.getElementById('stock').value) || 0;
            const weight = parseFloat(document.getElementById('weight').value) || 0;
            const height = parseFloat(document.getElementById('height').value) || 0;
            const width = parseFloat(document.getElementById('width').value) || 0;
            
            // Platform Selection (checkboxes)
            const platforms = {
                lazada: document.getElementById('platform-lazada').checked,
                shopee: document.getElementById('platform-shopee').checked,
                ebay: document.getElementById('platform-ebay').checked,
                tiktok: document.getElementById('platform-tiktok').checked,
                facebook: document.getElementById('platform-facebook').checked
            };
            
            // Get array of selected platform names
            const selectedPlatforms = Object.keys(platforms).filter(platform => platforms[platform]);
            
            // Log captured data for verification
            console.log('Form Data Captured:');
            console.log('Product Name:', productName);
            console.log('Product Image:', productImage ? productImage.name : 'No image selected');
            console.log('Description:', productDescription);
            console.log('Price:', price);
            console.log('Category:', category);
            console.log('Stock:', stock);
            console.log('Weight:', weight);
            console.log('Dimensions:', { height, width });
            console.log('Selected Platforms:', selectedPlatforms);
            
            // Form validation
            if (!productName) {
                alert('Please enter a product name');
                return;
            }
            
            if (!productImage) {
                alert('Please select a product image');
                return;
            }
            
            if (!category) {
                alert('Please select a category');
                return;
            }
            
            if (selectedPlatforms.length === 0) {
                alert('Please select at least one platform');
                return;
            }
            
            // Create product object
            const simpleProduct = {
                sellerid : 'd34293ca-d255-4bb0-b1ed-bb0891fe3fd8', // Example seller ID
                categoryid: category, // Use the selected category ID   
                productname : productName,
                description : productDescription,
                baseprice : price,
                weightkg : weight,
                heightcm : height,
                widthcm : width,
                productstocks: stock, // Use the stock value
            };

            // Call the async function to create product
            asyncFunc(simpleProduct, productImage);
        });
    } else {
        console.error('Create product button not found');
    }
}

// Call the function to attach the listener (can be called when DOM is ready or immediately)
attachButtonListener();

async function asyncFunc(simpleProduct, imageFile) {
    try {
        // Format the data correctly for addProduct function
        const productData = {
            product: simpleProduct  // addProduct expects {product: {...}}
        };
        
        const result = await addProduct(productData);
        console.log('Product created:', result.productid);
        
        // Upload the image if provided
        if (imageFile) {
            console.log('Uploading product image...');
            const imageResult = await addPicture(result.productid, imageFile, 1);
            console.log('Image uploaded:', imageResult.imageurl);
        }
        
        alert('Product created successfully!');
    } catch (error) {
        console.error('Error:', error.message);
        alert('Error creating product: ' + error.message);
    }
}

