(() => {
  if (window.AOS) {
    window.AOS.init({ duration: 650, once: true });
  }

  document.querySelectorAll('[data-dismiss-alert]').forEach((button) => {
    button.addEventListener('click', () => button.closest('[data-alert]')?.remove());
  });

  const sidebarToggle = document.querySelector('[data-sidebar-toggle]');
  const sidebar = document.getElementById('dashboardSidebar');
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  }

  document.querySelectorAll('[data-chart-config]').forEach((canvas) => {
    if (!window.Chart) return;
    const config = JSON.parse(canvas.dataset.chartConfig);
    const context = canvas.getContext('2d');
    new Chart(context, config);
  });

  document.querySelectorAll('.leaflet-map').forEach((mapElement) => {
    if (!window.L || mapElement.dataset.initialized === 'true') return;
    const points = JSON.parse(mapElement.dataset.points || '[]');
    const lat = Number(mapElement.dataset.lat || points[0]?.lat || 41.2995);
    const lng = Number(mapElement.dataset.lng || points[0]?.lng || 69.2401);
    const zoom = Number(mapElement.dataset.zoom || 11);

    const map = L.map(mapElement).setView([lat, lng], zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    points.forEach((point) => {
      L.marker([point.lat, point.lng])
        .addTo(map)
        .bindPopup(`<strong>${point.name || 'Nuqta'}</strong><br>${point.address || ''}`);
    });

    if (mapElement.dataset.clickable === 'true') {
      let marker = L.marker([lat, lng]).addTo(map);
      const latInput = document.querySelector(mapElement.dataset.latInput);
      const lngInput = document.querySelector(mapElement.dataset.lngInput);
      map.on('click', (event) => {
        marker.setLatLng(event.latlng);
        if (latInput) latInput.value = event.latlng.lat.toFixed(6);
        if (lngInput) lngInput.value = event.latlng.lng.toFixed(6);
      });
    }

    mapElement.dataset.initialized = 'true';
  });
})();
