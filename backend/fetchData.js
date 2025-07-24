import supabase  from '../backend/config/supabaseClient.js'; // your initialized Supabase client
 
console.log("This is javascript");


// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    // 1. Get a reference to the form element
    const addProductForm = document.querySelector('.add-product-form');

    // 2. Attach an event listener to the form's submit event
    addProductForm.addEventListener('submit', (event) => {
        // Prevent the default form submission behavior (page reload)
        event.preventDefault();

        // 3. Get references to each input element and 4. Extract their values

        // Product Details Section
        const productNameInput = document.getElementById('product-name');
        const productImageInput = document.getElementById('product-image'); // This will be a FileList object
        const productDescriptionInput = document.getElementById('product-description');
        const priceInput = document.getElementById('price');
        const categorySelect = document.getElementById('category');
        const stockInput = document.getElementById('stock');
        const weightInput = document.getElementById('weight');
        const heightInput = document.getElementById('height');
        const widthInput = document.getElementById('width'); // Note: You have two inputs with id 'height'. The second one should be 'width'. I've assumed it's 'width' based on the label.

        // Publish to Platforms Section
        const platformLazadaCheckbox = document.getElementById('platform-lazada');
        const platformShopeeCheckbox = document.getElementById('platform-shopee');
        const platformEbayCheckbox = document.getElementById('platform-ebay');
        const platformTiktokCheckbox = document.getElementById('platform-tiktok');
        const platformFacebookCheckbox = document.getElementById('platform-facebook');

        // Store the input values in local variables
        const productName = productNameInput.value;
        const productImage = productImageInput.files[0]; // Get the first selected file
        const productDescription = productDescriptionInput.value;
        const price = parseFloat(priceInput.value); // Convert to a number
        const category = categorySelect.value;
        const stock = parseInt(stockInput.value, 10); // Convert to an integer
        const weight = parseFloat(weightInput.value); // Convert to a number
        const height = parseFloat(heightInput.value); // Convert to a number
        const width = parseFloat(widthInput.value); // Convert to a number

        // For checkboxes, check their 'checked' property
        const publishToLazada = platformLazadaCheckbox.checked;
        const publishToShopee = platformShopeeCheckbox.checked;
        const publishToEbay = platformEbayCheckbox.checked;
        const publishToTiktok = platformTiktokCheckbox.checked;
        const publishToFacebook = platformFacebookCheckbox.checked;

        // You can now use these local variables (e.g., `productName`, `price`, etc.)
        // For demonstration, let's log them to the console:
        console.log('--- Product Details ---');
        console.log('Product Name:', productName);
        console.log('Product Image:', productImage ? productImage.name : 'No image selected');
        console.log('Product Description:', productDescription);
        console.log('Price:', price);
        console.log('Category:', category);
        console.log('Stock:', stock);
        console.log('Weight (kg):', weight);
        console.log('Height (inch):', height);
        console.log('Width (inch):', width); // Corrected from height to width

        console.log('\n--- Publish to Platforms ---');
        console.log('Publish to Lazada:', publishToLazada);
        console.log('Publish to Shopee:', publishToShopee);
        console.log('Publish to eBay:', publishToEbay);
        console.log('Publish to TikTok:', publishToTiktok);
        console.log('Publish to Facebook:', publishToFacebook);

        // --- Next Steps ---
        // At this point, you typically would:
        // 1. Validate the fetched data.
        // 2. Send the data to a server (e.g., using `fetch` API or XMLHttpRequest).
        // 3. Update the UI to confirm submission or show errors.
    });
});
  // ✅ You can now push these values into Supabase or a backend handler
