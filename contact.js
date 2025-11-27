// contact.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");

  const showError = (id, msg) => {
    const el = document.getElementById(id);
    el.textContent = msg;
    el.classList.remove("hidden");
  };

  const clearError = (id) => {
    const el = document.getElementById(id);
    el.textContent = "";
    el.classList.add("hidden");
  };

  const validateForm = () => {
    let valid = true;

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    // Name validation
    if (name.length < 3) {
      showError("nameError", "Name must be at least 3 characters long.");
      valid = false;
    } else {
      clearError("nameError");
    }

    // Email validation
    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/i;
    if (!emailPattern.test(email)) {
      showError("emailError", "Please enter a valid email address.");
      valid = false;
    } else {
      clearError("emailError");
    }

    // Message validation
    if (message.length < 10) {
      showError("messageError", "Message must be at least 10 characters.");
      valid = false;
    } else {
      clearError("messageError");
    }

    return valid;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const formData = new FormData(form);

    try {
      const res = await axios.post(
        "https://formspree.io/f/xnnozqer",
        {
          name: formData.get("name"),
          email: formData.get("email"),
          message: formData.get("message"),
        },
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (res.status === 200) {
        alert("🎉 Message sent successfully!");
        form.reset();
      } else {
        alert("⚠️ Oops! Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Oops! Something went wrong.");
    }
  });
});
