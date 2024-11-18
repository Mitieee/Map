const socket = io();
const map = L.map("map", {
  center: [-23.5505, -46.6333],
  zoom: 13,
});
const userMarkers = {};
const loadedUsers = new Set();

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {}).addTo(
  map
);

function sendLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      (position) => {
        const pos = [position.coords.latitude, position.coords.longitude];

        socket.emit("enviar-localizacao", {
          id: socket.id,
          location: pos,
          nome: "Exemplo",
        });

        if (!userMarkers[socket.id]) {
          userMarkers[socket.id] = L.marker(pos)
            .addTo(map)
            .bindPopup("Você está aqui!")
            .openPopup();
        } else {
          userMarkers[socket.id].setLatLng(pos);
        }
      },
      (error) => {
        console.error("Erro ao tentar acessar a localização:", error);
        alert(
          "Não foi possível acessar sua localização. Por favor, ative e permita o acesso."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  } else {
    alert("Geolocalização não é suportada pelo seu navegador.");
  }
}

sendLocation();

socket.on("todos-usuarios", (users) => {
  users.forEach((user) => {
    if (user.location && user.id !== socket.id && !loadedUsers.has(user.id)) {
      loadedUsers.add(user.id);
      userMarkers[user.id] = L.marker(user.location)
        .addTo(map)
        .bindPopup("Emergência está indo")
        .openPopup();
    }
  });
});

map.on("moveend", () => {
  const center = map.getCenter();
});
