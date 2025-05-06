document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const previewArea = document.getElementById('previewArea');
    const processBtn = document.getElementById('processBtn');
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    const maintainAspect = document.getElementById('maintainAspect');
    const formatSelect = document.getElementById('format');
    const qualityInput = document.getElementById('quality');
    
    let uploadedFiles = [];
    
    // Handle drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('active');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('active');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('active');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFiles(files);
        }
    });
    
    // Handle click to select files
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            handleFiles(fileInput.files);
        }
    });
    
    // Maintain aspect ratio functionality
    widthInput.addEventListener('input', () => {
        if (maintainAspect.checked && uploadedFiles.length > 0) {
            const originalImage = uploadedFiles[0];
            const aspectRatio = originalImage.naturalHeight / originalImage.naturalWidth;
            heightInput.value = Math.round(widthInput.value * aspectRatio);
        }
    });
    
    heightInput.addEventListener('input', () => {
        if (maintainAspect.checked && uploadedFiles.length > 0) {
            const originalImage = uploadedFiles[0];
            const aspectRatio = originalImage.naturalWidth / originalImage.naturalHeight;
            widthInput.value = Math.round(heightInput.value * aspectRatio);
        }
    });
    
    // Process images button click
    processBtn.addEventListener('click', processImages);
    
    function handleFiles(files) {
        uploadedFiles = [];
        previewArea.innerHTML = '';
        
        Array.from(files).forEach((file) => {
            if (!file.type.match('image.*')) return;
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                
                img.onload = () => {
                    uploadedFiles.push(img);
                    
                    // Create preview item
                    const previewItem = document.createElement('div');
                    previewItem.className = 'preview-item';
                    
                    const previewImg = document.createElement('img');
                    previewImg.src = e.target.result;
                    
                    const fileInfo = document.createElement('div');
                    fileInfo.className = 'file-info';
                    fileInfo.textContent = `${file.name} (${img.naturalWidth}x${img.naturalHeight})`;
                    
                    previewItem.appendChild(previewImg);
                    previewItem.appendChild(fileInfo);
                    previewArea.appendChild(previewItem);
                    
                    // If this is the first image and maintain aspect ratio is checked,
                    // update height based on the image's aspect ratio
                    if (uploadedFiles.length === 1 && maintainAspect.checked) {
                        const aspectRatio = img.naturalHeight / img.naturalWidth;
                        heightInput.value = Math.round(widthInput.value * aspectRatio);
                    }
                };
            };
            
            reader.readAsDataURL(file);
        });
        
        // Show settings panel if files were loaded
        if (files.length > 0) {
            document.querySelector('.settings-panel').style.display = 'block';
        }
    }
    
    function processImages() {
        if (uploadedFiles.length === 0) return;
        
        const width = parseInt(widthInput.value);
        const height = parseInt(heightInput.value);
        const format = formatSelect.value;
        const quality = parseInt(qualityInput.value) / 100;
        
        uploadedFiles.forEach((img, index) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set dimensions
            canvas.width = width;
            canvas.height = height;
            
            // Draw image on canvas
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to desired format
            const mimeType = `image/${format === 'jpeg' ? 'jpeg' : format}`;
            const dataUrl = canvas.toDataURL(mimeType, quality);
            
            // Create download link
            const link = document.createElement('a');
            link.download = `resized_${index + 1}.${format}`;
            link.href = dataUrl;
            link.textContent = 'Download';
            link.className = 'download-btn';
            
            // Add download button to the preview item
            const previewItems = document.querySelectorAll('.preview-item');
            if (previewItems[index]) {
                if (previewItems[index].querySelector('.download-btn')) {
                    previewItems[index].querySelector('.download-btn').remove();
                }
                previewItems[index].appendChild(link);
                
                // Update the preview image
                previewItems[index].querySelector('img').src = dataUrl;
            }
        });
    }
});
