document.addEventListener('DOMContentLoaded', function() {
  const clickableContainer = document.querySelector('.clickable-container');

  if (clickableContainer) {
    clickableContainer.addEventListener('click', function() {
      window.location.href = 'https://kleinpanic.com/';
    });
  }
});