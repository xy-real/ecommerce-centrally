
console.log("Hello World!");
function attachButtonListener() {
    const createButton = document.querySelector('.add-stock-btn');
    
    if (createButton) {
        createButton.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default form submission
            
            // Capture all form inputs into local variables
            const num = document.getElementById('quantity').value;
            // Product Details
            const myDiv = document.getElementsByClassName('stock-value');

            myDiv[0].textContent = num; // Update the text content of the first element with class 'stock-value'
            // Platform Selection (checkboxes)
          
            
            // Get array of selected platform names
        
            
            // Log captured data for verification
           
            // Form validation
        
            })
            
            // Create product object
         

            // Call the async function to create product
    
    }
}

attachButtonListener();