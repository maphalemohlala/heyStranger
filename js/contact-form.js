/* ==========================================================================
   Hey, Stranger Coffee Collective — contact-form.js (IWED5112 POE Part 3)
   Client-side validation for the enquiry form on contact.html.

   Source: adapted from the "Validating forms using JavaScript" example in
   MDN Web Docs (2026) "Client-side form validation", which uses the
   Constraint Validation API (field.validity, novalidate, showError()).
   https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation

   Customised for Hey, Stranger:
     - five fields (MDN example has one) with friendly, on-brand messages;
     - South African phone number pattern, optional field;
     - required fields that contain only spaces are treated as empty;
     - errors appear when a visitor leaves a field and clear as they type;
     - on submit, focus moves to the first problem and a summary is shown;
     - a valid enquiry opens the visitor's email app with the message
       pre-filled (mailto:), so the form works without a server.
   ========================================================================== */

(function () {
  'use strict';

  var form = document.getElementById('enquiry-form');
  if (!form) { return; }

  var status = document.getElementById('form-status');
  var fields = form.querySelectorAll('input, select, textarea');
  var cafeEmail = 'hello@heystranger.co.za';

  // JavaScript is running, so switch off the browser's default pop-up
  // messages and show our own messages instead (MDN pattern).
  form.noValidate = true;

  // One function per field returns the message for whatever is wrong.
  var messages = {
    name: function (field) {
      if (isEmpty(field)) { return 'Please tell us your name.'; }
      if (field.value.trim().length < field.minLength) { return 'Your name should be at least ' + field.minLength + ' characters.'; }
      return '';
    },
    email: function (field) {
      if (isEmpty(field)) { return 'Please enter your email address so we can reply.'; }
      if (field.validity.typeMismatch) { return 'That doesn’t look like an email address — e.g. name@example.com.'; }
      return '';
    },
    phone: function (field) {
      if (field.validity.patternMismatch) { return 'Please use a South African number, e.g. 082 123 4567 or +27 82 123 4567.'; }
      return '';
    },
    topic: function (field) {
      if (field.validity.valueMissing) { return 'Please choose what your enquiry is about.'; }
      return '';
    },
    message: function (field) {
      if (isEmpty(field)) { return 'Please write a short message.'; }
      if (field.value.trim().length < field.minLength) {
        return 'Please give us a little more detail (at least ' + field.minLength + ' characters).';
      }
      return '';
    }
  };

  // A required field holding only spaces counts as empty.
  function isEmpty(field) {
    return field.required && field.value.trim() === '';
  }

  // Shows (or clears) the message under one field. Returns true if valid.
  function showError(field) {
    var errorBox = document.getElementById(field.id + '-error');
    var text = messages[field.name](field);

    errorBox.textContent = text;
    field.classList.toggle('is-invalid', text !== '');
    field.setAttribute('aria-invalid', text !== '' ? 'true' : 'false');
    return text === '';
  }

  // Validate a field when the visitor leaves it; once it has shown an
  // error, re-check on every keystroke so the message clears immediately.
  Array.prototype.forEach.call(fields, function (field) {
    field.addEventListener('blur', function () {
      if (field.value !== '' || field.classList.contains('is-invalid')) {
        showError(field);
      }
    });
    field.addEventListener('input', function () {
      if (field.classList.contains('is-invalid')) {
        showError(field);
      }
    });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var firstProblem = null;
    var problems = 0;

    Array.prototype.forEach.call(fields, function (field) {
      if (!showError(field)) {
        problems += 1;
        if (!firstProblem) { firstProblem = field; }
      }
    });

    if (problems > 0) {
      status.className = 'form-status problem';
      status.textContent = 'Please check the ' + (problems === 1 ? 'highlighted field' : problems + ' highlighted fields') + ' and try again.';
      firstProblem.focus();
      return;
    }

    // All valid: build an email the visitor can send from their own app.
    var name = form.elements.name.value.trim();
    var body =
      'Name: ' + name + '\n' +
      'Email: ' + form.elements.email.value.trim() + '\n' +
      'Phone: ' + (form.elements.phone.value.trim() || 'not given') + '\n' +
      'Enquiry: ' + form.elements.topic.value + '\n\n' +
      form.elements.message.value.trim();

    window.location.href = 'mailto:' + cafeEmail +
      '?subject=' + encodeURIComponent('Website enquiry: ' + form.elements.topic.value) +
      '&body=' + encodeURIComponent(body);

    status.className = 'form-status success';
    status.textContent = 'Thank you, ' + name + '! Your email app should now open with your enquiry ready to send to ' +
      cafeEmail + '. If it doesn’t, please email us directly.';
    form.reset();
  });
}());
