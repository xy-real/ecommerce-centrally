document.getElementById('product-image').addEventListener('change', function (event) {
    const file = event.target.files[0];
    const previewContainer = document.getElementById('preview-container');
    previewContainer.innerHTML = ''; // Clear previous preview

    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = 'Uploaded image preview';
            img.style.maxWidth = '100%';
            img.style.marginTop = '10px';
            previewContainer.appendChild(img);
        };
        reader.readAsDataURL(file);
    }
});