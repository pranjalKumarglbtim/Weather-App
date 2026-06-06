/* ===== Geolocation ===== */
class LocationService {
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error("Geolocation is not supported by your browser."));
      }
      
      const options = { enableHighAccuracy: false, timeout: 15000, maximumAge: 10 * 60 * 1000 };
      
      const getPos = () => {
        navigator.geolocation.getCurrentPosition(
          pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
          err => {
            let msg = "Could not get your location.";
            if (err.code === 1) msg = "Location permission denied. Please enable location access in your browser settings.";
            else if (err.code === 2) msg = "Location unavailable. Please check your device's location services.";
            else if (err.code === 3) msg = "Location request timed out. Please try again.";
            reject(new Error(msg));
          },
          options
        );
      };
      
      // Check permission state if available
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' }).then(permission => {
          if (permission.state === 'denied') {
            reject(new Error("Location permission denied. Please enable location access in browser settings."));
          } else {
            getPos();
          }
        }).catch(() => getPos());
      } else {
        getPos();
      }
    });
  }
}

window.locationService = new LocationService();
