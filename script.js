document.addEventListener('DOMContentLoaded', () => {
    const crisisNameInput = document.getElementById('crisisName');
    const submitBtn = document.getElementById('submitBtn');
    const result = document.getElementById('result');
    const responseContent = document.getElementById('responseContent');
    const spinner = submitBtn.querySelector('.spinner');

    submitBtn.addEventListener('click', async () => {
        const crisisName = crisisNameInput.value.trim();
        if (!crisisName) {
            alert('Please enter a crisis name.');
            return;
        }

        // Show loading state
        submitBtn.disabled = true;
        spinner.classList.remove('hidden');
        result.classList.add('hidden');

        try {
            const response = await fetch('/api/generate-strategy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    crisisName: crisisName
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            
            // Format and display the response
            responseContent.innerHTML = formatResponse(data.response);
            result.classList.remove('hidden');
        } catch (error) {
            console.error('Error:', error);
            result.classList.remove('hidden');
            responseContent.innerHTML = 'An error occurred while analyzing the crisis. Please try again.';
        } finally {
            // Reset loading state
            submitBtn.disabled = false;
            spinner.classList.add('hidden');
        }
    });

    function formatResponse(text) {
        // Remove any markdown formatting
        text = text.replace(/##\s/g, '').replace(/\*\*/g, '');
        
        // Convert line breaks to paragraphs and preserve formatting
        return text
            .split('\n')
            .map(line => {
                line = line.trim();
                if (!line) return '';
                
                // Check if line is a numbered list item
                if (/^\d+\./.test(line)) {
                    return line; // Keep numbered lists as is
                }
                
                return `<p>${line}</p>`;
            })
            .join('\n')
            .replace(/\n{2,}/g, '\n'); // Remove extra line breaks
    }
}); 