  emailjs.init("Zd5YEhvp49eBkeX-W"); 

  // Handle form submission
  document.getElementById("carform").addEventListener("submit", function (event) {
    event.preventDefault();

    const form = event.target;

    // Prepare data to match your EmailJS template fields
    const data = {
      full_name: form.fullName.value,
      email: form.email.value,
      phone: form.phone.value,
      additional_info: form.additionalInfo.value,
      name: form.fullName.value, // If your template expects a "name" field
      time: form.pickupTime.value, // If your template expects a "time" field
      timestamp: new Date().toLocaleString()
    };

    // Send email using EmailJS
    emailjs.send("service_qn0iqj6", "template_z30ovkn", data)
      .then(() => {
        alert("Request sent successfully!");
        form.reset();
      })
      .catch((error) => {
        console.error("EmailJS Error:", error);
        alert("Failed to send request. Please try again.");
      });
  });
