// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');
    const successMessage = document.getElementById('successMessage');

    // Form validation function
    function validateForm() {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        // Clear previous validation states
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('invalid');
        });

        // Validate each required field
        requiredFields.forEach(field => {
            const formGroup = field.closest('.form-group');
            
            if (field.type === 'radio') {
                const radioGroup = form.querySelectorAll(`input[name="${field.name}"]`);
                const isChecked = Array.from(radioGroup).some(radio => radio.checked);
                
                if (!isChecked) {
                    formGroup.classList.add('invalid');
                    isValid = false;
                }
            } else if (field.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!field.value.trim() || !emailRegex.test(field.value)) {
                    formGroup.classList.add('invalid');
                    isValid = false;
                }
            } else if (field.type === 'tel') {
                const phoneRegex = /^[\+]?[0-9][\d]{0,15}$/;
                const cleanPhone = field.value.replace(/[\s\-]/g, '');
                if (!field.value.trim() || !phoneRegex.test(cleanPhone)) {
                    formGroup.classList.add('invalid');
                    isValid = false;
                }
            } else if (field.type === 'date') {
                if (!field.value.trim() || !isValidAge(field.value)) {
                    formGroup.classList.add('invalid');
                    isValid = false;
                }
            } else if (!field.value.trim()) {
                formGroup.classList.add('invalid');
                isValid = false;
            }
        });

        return isValid;
    }

    // Check if user is at least 16 years old
    function isValidAge(dateString) {
        const today = new Date();
        const birthDate = new Date(dateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age >= 16;
    }

    // Real-time validation
    form.addEventListener('input', function(e) {
        const formGroup = e.target.closest('.form-group');
        if (formGroup && formGroup.classList.contains('invalid')) {
            // Re-validate the specific field
            if (e.target.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (e.target.value.trim() && emailRegex.test(e.target.value)) {
                    formGroup.classList.remove('invalid');
                }
            } else if (e.target.type === 'tel') {
                const phoneRegex = /^[\+]?[0-9][\d]{0,15}$/;
                const cleanPhone = e.target.value.replace(/[\s\-]/g, '');
                if (e.target.value.trim() && phoneRegex.test(cleanPhone)) {
                    formGroup.classList.remove('invalid');
                }
            } else if (e.target.type === 'date') {
                if (e.target.value.trim() && isValidAge(e.target.value)) {
                    formGroup.classList.remove('invalid');
                }
            } else if (e.target.value.trim()) {
                formGroup.classList.remove('invalid');
            }
        }
    });

    // Handle radio button validation
    form.addEventListener('change', function(e) {
        if (e.target.type === 'radio') {
            const formGroup = e.target.closest('.form-group');
            if (formGroup && formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid');
            }
        }
    });

    // Handle "Other" hobby checkbox
    document.getElementById('other-hobby').addEventListener('change', function() {
        const otherText = document.getElementById('other-hobby-text');
        if (this.checked) {
            otherText.disabled = false;
            otherText.focus();
        } else {
            otherText.disabled = true;
            otherText.value = '';
        }
    });

    // Form submission handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            // Show loading state
            const submitBtn = document.querySelector('.submit-btn');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Processing...';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.8';

            // Simulate processing time
            setTimeout(() => {
                // Collect form data
                const formData = new FormData(form);
                const data = {};
                
                // Get regular form fields
                for (let [key, value] of formData.entries()) {
                    if (data[key]) {
                        if (Array.isArray(data[key])) {
                            data[key].push(value);
                        } else {
                            data[key] = [data[key], value];
                        }
                    } else {
                        data[key] = value;
                    }
                }
                
                // Get hobbies with special handling for "other"
                const hobbies = [];
                document.querySelectorAll('input[name="hobbies"]:checked').forEach(checkbox => {
                    if (checkbox.value === 'other') {
                        const otherText = document.getElementById('other-hobby-text').value.trim();
                        if (otherText) {
                            hobbies.push(otherText);
                        }
                    } else {
                        hobbies.push(checkbox.value);
                    }
                });
                data.hobbies = hobbies;

                // Display collected data in console
                console.log('=== REGISTRATION DATA ===');
                console.log('Full Name:', data.fullName);
                console.log('Email:', data.email);
                console.log('Phone:', data.phone);
                console.log('Date of Birth:', data.dateOfBirth);
                console.log('Gender:', data.gender);
                console.log('Program of Study:', data.program);
                console.log('Hobbies:', data.hobbies);
                console.log('Address:', data.address);
                console.log('========================');
                
                // Show success modal
                showSuccessModal(data);
                
                // Hide the form
                form.style.display = 'none';
                
                // Reset button state
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
            }, 1000);
        } else {
            // Scroll to first error
            const firstError = document.querySelector('.form-group.invalid');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });

    // Function to show success modal
    function showSuccessModal(data) {
        const modal = document.getElementById('successModal');
        const detailsContainer = document.getElementById('registrationDetails');
        
        // Populate registration details
        const formatValue = (key, value) => {
            if (key === 'hobbies' && Array.isArray(value)) {
                return value.length > 0 ? value.join(', ') : 'None selected';
            }
            if (key === 'program') {
                return value.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ');
            }
            if (key === 'gender') {
                return value.charAt(0).toUpperCase() + value.slice(1);
            }
            return value || 'Not provided';
        };
        
        const fieldLabels = {
            fullName: 'Full Name',
            email: 'Email',
            phone: 'Phone Number',
            dateOfBirth: 'Date of Birth',
            gender: 'Gender',
            program: 'Program of Study',
            hobbies: 'Hobbies',
            address: 'Address'
        };
        
        detailsContainer.innerHTML = `
            <h3>Registration Details</h3>
            ${Object.entries(data).map(([key, value]) => {
                if (fieldLabels[key]) {
                    return `
                        <div class="detail-item">
                            <span class="detail-label">${fieldLabels[key]}:</span>
                            <span class="detail-value">${formatValue(key, value)}</span>
                        </div>
                    `;
                }
                return '';
            }).join('')}
        `;
        
        modal.classList.add('show');
        
        // Auto-hide modal after 10 seconds if not interacted with
        setTimeout(() => {
            if (modal.classList.contains('show')) {
                hideSuccessModal();
            }
        }, 10000);
    }
    
    // Function to hide success modal
    function hideSuccessModal() {
        const modal = document.getElementById('successModal');
        modal.classList.remove('show');
        
        // Reset form after modal is hidden
        setTimeout(() => {
            resetForm();
        }, 5000);
    }
    
    // Modal event listeners
    document.getElementById('closeModalBtn').addEventListener('click', hideSuccessModal);
    
    document.getElementById('viewDetailsBtn').addEventListener('click', function() {
        const details = document.getElementById('registrationDetails');
        if (details.style.display === 'none' || details.style.display === '') {
            details.style.display = 'block';
            this.textContent = 'Hide Details';
        } else {
            details.style.display = 'none';
            this.textContent = 'View Details';
        }
    });
    
    // Close modal when clicking outside
    document.getElementById('successModal').addEventListener('click', function(e) {
        if (e.target === this) {
            hideSuccessModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('successModal');
            if (modal.classList.contains('show')) {
                hideSuccessModal();
            }
        }
    });

    // Function to reset form
    function resetForm() {
        form.reset();
        successMessage.style.display = 'none';
        form.style.display = 'block';
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('invalid');
        });
        
        // Reset other hobby input
        const otherHobbyText = document.getElementById('other-hobby-text');
        otherHobbyText.disabled = true;
        otherHobbyText.value = '';
    }

    // Phone number formatting
    document.getElementById('phone').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        // Limit to reasonable phone number length
        if (value.length > 15) {
            value = value.slice(0, 15);
        }
        
        // Format based on length for Indonesian phone numbers
        if (value.length > 0) {
            if (value.startsWith('08')) {
                // Format: 0878-7008-1033
                if (value.length <= 4) {
                    value = value;
                } else if (value.length <= 8) {
                    value = value.slice(0, 4) + '-' + value.slice(4);
                } else {
                    value = value.slice(0, 4) + '-' + value.slice(4, 8) + '-' + value.slice(8);
                }
            } else if (value.startsWith('62')) {
                // Format: 62-878-7008-1033
                if (value.length <= 2) {
                    value = value;
                } else if (value.length <= 5) {
                    value = value.slice(0, 2) + '-' + value.slice(2);
                } else if (value.length <= 9) {
                    value = value.slice(0, 2) + '-' + value.slice(2, 5) + '-' + value.slice(5);
                } else {
                    value = value.slice(0, 2) + '-' + value.slice(2, 5) + '-' + value.slice(5, 9) + '-' + value.slice(9);
                }
            } else {
                // Default formatting
                if (value.length <= 4) {
                    value = value;
                } else if (value.length <= 8) {
                    value = value.slice(0, 4) + '-' + value.slice(4);
                } else {
                    value = value.slice(0, 4) + '-' + value.slice(4, 8) + '-' + value.slice(8);
                }
            }
        }
        
        e.target.value = value;
    });

    // Set constraints for date input
    function setDateConstraints() {
        const dateInput = document.getElementById('dateOfBirth');
        const today = new Date();
        
        // Set maximum date to 16 years ago
        const maxDate = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
        dateInput.max = maxDate.toISOString().split('T')[0];
        
        // Set minimum date to 100 years ago (reasonable limit)
        const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
        dateInput.min = minDate.toISOString().split('T')[0];
    }

    // Initialize date constraints
    setDateConstraints();

    // Form field focus effects
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });

    // Add keyboard navigation support
    document.addEventListener('keydown', function(e) {
        // Submit form with Ctrl+Enter
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            form.dispatchEvent(new Event('submit'));
        }
        
        // Reset form with Ctrl+R (prevent page refresh and reset form instead)
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            if (confirm('Are you sure you want to reset the form?')) {
                resetForm();
            }
        }
    });

    // Add form data persistence (in memory only - no localStorage)
    let formDataBackup = {};
    
    function backupFormData() {
        const formData = new FormData(form);
        formDataBackup = {};
        
        for (let [key, value] of formData.entries()) {
            formDataBackup[key] = value;
        }
        
        // Backup hobbies
        const hobbies = [];
        document.querySelectorAll('input[name="hobbies"]:checked').forEach(checkbox => {
            hobbies.push(checkbox.value);
        });
        formDataBackup.hobbies = hobbies;
        
        // Backup other hobby text
        const otherHobbyText = document.getElementById('other-hobby-text').value;
        if (otherHobbyText) {
            formDataBackup.otherHobbyText = otherHobbyText;
        }
    }
    
    function restoreFormData() {
        if (Object.keys(formDataBackup).length === 0) return;
        
        for (let [key, value] of Object.entries(formDataBackup)) {
            if (key === 'hobbies') {
                value.forEach(hobby => {
                    const checkbox = document.querySelector(`input[name="hobbies"][value="${hobby}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            } else if (key === 'otherHobbyText') {
                const otherHobbyText = document.getElementById('other-hobby-text');
                if (otherHobbyText) otherHobbyText.value = value;
            } else {
                const field = form.querySelector(`[name="${key}"]`);
                if (field) {
                    if (field.type === 'radio') {
                        const radioButton = form.querySelector(`input[name="${key}"][value="${value}"]`);
                        if (radioButton) radioButton.checked = true;
                    } else {
                        field.value = value;
                    }
                }
            }
        }
    }
    
    // Backup form data on change
    form.addEventListener('input', backupFormData);
    form.addEventListener('change', backupFormData);
    
    // Console welcome message
    console.log('%c🎓 Binus University Registration Form', 'color: #667eea; font-size: 16px; font-weight: bold;');
    console.log('%cForm is ready! Fill out the form and check this console for submitted data.', 'color: #666; font-size: 12px;');
});

// Global utility functions
window.registrationForm = {
    // Function to programmatically validate form
    validate: function() {
        return document.getElementById('registrationForm').dispatchEvent(new Event('submit'));
    },
    
    // Function to get current form data
    getData: function() {
        const form = document.getElementById('registrationForm');
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Get hobbies with special handling for "other"
        const hobbies = [];
        document.querySelectorAll('input[name="hobbies"]:checked').forEach(checkbox => {
            if (checkbox.value === 'other') {
                const otherText = document.getElementById('other-hobby-text').value.trim();
                if (otherText) {
                    hobbies.push(otherText);
                }
            } else {
                hobbies.push(checkbox.value);
            }
        });
        data.hobbies = hobbies;
        
        return data;
    },
    
    // Function to reset form
    reset: function() {
        const form = document.getElementById('registrationForm');
        form.reset();
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('invalid');
        });
        document.getElementById('successMessage').style.display = 'none';
        form.style.display = 'block';
        
        // Reset other hobby input
        const otherHobbyText = document.getElementById('other-hobby-text');
        otherHobbyText.disabled = true;
        otherHobbyText.value = '';
    }
};