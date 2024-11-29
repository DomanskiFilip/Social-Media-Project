document.addEventListener('DOMContentLoaded', () => {
    fetch('/M00982633/weather')
      .then(response => response.json())
      .then(data => {
        document.getElementById("API").innerHTML = `Logging From: ${data.location.country} | current temp: ${data.current.temp_c}°C`;
      })
      .catch(error => console.error('Error fetching weather data:', error));
  });