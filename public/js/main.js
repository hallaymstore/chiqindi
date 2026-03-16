(() => {
  if (window.AOS) {
    window.AOS.init({ duration: 700, once: true, easing: 'ease-out-cubic' });
  }

  document.querySelectorAll('[data-alert]').forEach((alert) => {
    const button = alert.querySelector('[data-dismiss-alert]');
    if (button) {
      button.addEventListener('click', () => alert.remove());
    }
  });

  document.querySelectorAll('[data-counter]').forEach((counter) => {
    const target = Number(counter.dataset.counter || 0);
    const suffix = counter.dataset.suffix || '';
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 40));
    const tick = () => {
      current += step;
      if (current >= target) {
        counter.textContent = `${target}${suffix}`;
        return;
      }
      counter.textContent = `${current}${suffix}`;
      requestAnimationFrame(tick);
    };
    tick();
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
        .bindPopup(`<strong>${point.name}</strong><br>${point.address || ''}`);
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
