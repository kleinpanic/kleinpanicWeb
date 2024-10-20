document.querySelector('button').addEventListener('click', function(event) {
  event.preventDefault(); // Prevent form submission

  // Grab the form inputs
  const name = document.querySelector('input[type="text"]').value.trim();
  const email = document.querySelector('input[type="email"]').value.trim();
  const message = document.querySelector('textarea').value.trim();

  // Simple frontend validation
  if (!name || !email || !message) {
    alert("Please fill in all fields.");
    return;
  }

  // Validate email format
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  // Disable the button to prevent spamming
  const sendButton = document.querySelector('button');
  sendButton.disabled = true;
  sendButton.innerText = "Sending...";

  // Prepare data to send
  const data = {
    name: name,
    email: email,
    message: message
  };

  // Send data to the backend via fetch API
  fetch('/contact/submit-contact-form', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  .then(response => {
    // Check if the response is OK (status code 200)
    if (!response.ok) {
      // If response status is not ok, attempt to get error message
      return response.json().then(errData => {
        throw new Error(errData.message || "Unknown error occurred.");
      });
    }
    return response.json(); // Parse the success response JSON
  })
  .then(data => {
    if (data.success) {
      // Show success message and reset the form
      alert("Message sent successfully! Thank you for reaching out.");
      document.querySelector('form').reset(); // Reset the form after successful submission
    } else {
      // Show error message returned from server
      alert(data.message || "There was an error sending your message. Please try again later.");
    }
  })
  .catch((error) => {
    // Log the error and display the error message to the user
    console.error('Error:', error);
    alert(error.message || "There was an error sending your message. Please try again later.");
  })
  .finally(() => {
    // Always re-enable the button and reset the button text
    sendButton.disabled = false;
    sendButton.innerText = "Send Message";
  });
});