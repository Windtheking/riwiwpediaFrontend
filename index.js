const navItems = document.querySelectorAll('.nav-item');

navItems.forEach(item => {
  item.addEventListener('click', function(event) {
    // Remove the 'active' class from all elements.
    navItems.forEach(navItem => navItem.classList.remove('active'));
    // Adds the 'active' element to the clicked element.
    this.classList.add('active');
  });
});

const sliderWrapper = document.getElementById('slider-wrapper');

sliderWrapper.addEventListener('mouseenter', () => {
  sliderWrapper.style.animationPlayState = 'paused';
});


sliderWrapper.addEventListener('mouseleave', () => {
  sliderWrapper.style.animationPlayState = 'running';
});

