document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registrationForm');

  form.addEventListener('submit', (e) => {
    e.preventDefault();


    const required = form.querySelectorAll('[required]');
    for (let field of required) {
      if (!field.value.trim()) {
        alert('Please fill all required fields!');
        field.focus();
        return;
      }
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const hobbies = [];
    document.querySelectorAll('input[name="hobbies"]:checked').forEach(cb => {
      hobbies.push(cb.value);
    });
    data.hobbies = hobbies;


    console.log('=== Registration Data ===');
    console.log(data);

    alert('Registration successful!');
    form.reset();
  });
});
