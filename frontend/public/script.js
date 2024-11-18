let map = L.map('map').setView([-23.5505, -46.6333], 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

let userMarker;

function updatePosition(position) {
    const pos = [position.coords.latitude, position.coords.longitude];
    if (!userMarker) {
        userMarker = L.marker(pos).addTo(map).bindPopup("Você está aqui").openPopup();
        emergencyResponse("Estou indo!");
    } else {
        userMarker.setLatLng(pos);
    }
    map.setView(pos, 15);
}

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(updatePosition, (error) => {
        console.error("Erro ao obter localização: ", error);
    });
} else {
    alert("Geolocalização não suportada pelo seu navegador.");
}

function cancelar() {
    const confirmCancel = confirm("Tem certeza que deseja cancelar?");
    if (confirmCancel) {
        sendMessage("Localização cancelada pelo usuário.");
        emergencyResponse("Cancelamento registrado.");
    }
}

function sendMessage(content = null) {
    const chatBox = document.getElementById('chat-box');
    const chatInput = document.getElementById('chat-message');
    const message = content || chatInput.value.trim();

    if (message) {
        const msgElement = document.createElement('div');
        msgElement.classList.add('chat-message');

        const messageContent = document.createElement('span');
        messageContent.textContent = `Você: ${message}`;

        const buttons = document.createElement('div');
        buttons.classList.add('chat-buttons');

        const editButton = document.createElement('button');
        editButton.classList.add('edit');
        editButton.textContent = "Editar";
        editButton.onclick = () => editMessage(msgElement, messageContent);

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete');
        deleteButton.textContent = "Cancelar";
        deleteButton.onclick = () => deleteMessage(msgElement);

        const resendButton = document.createElement('button');
        resendButton.classList.add('resend');
        resendButton.textContent = "Reenviar";
        resendButton.onclick = () => resendMessage(message);

        const complaintButton = document.createElement('button');
        complaintButton.classList.add('complaint');
        complaintButton.textContent = "Reclamar";
        complaintButton.onclick = () => makeComplaint();

        buttons.appendChild(editButton);
        buttons.appendChild(deleteButton);
        buttons.appendChild(resendButton);
        buttons.appendChild(complaintButton);

        msgElement.appendChild(messageContent);
        msgElement.appendChild(buttons);
        chatBox.appendChild(msgElement);

        chatBox.scrollTop = chatBox.scrollHeight;
        chatInput.value = '';
    }
}

function emergencyResponse(responseMessage) {
    const chatBox = document.getElementById('chat-box');
    const responseElement = document.createElement('div');
    responseElement.textContent = `Emergência: ${responseMessage}`;
    responseElement.style.color = "green";
    chatBox.appendChild(responseElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function editMessage(msgElement, messageContent) {
    const newMessage = prompt("Edite sua mensagem:", messageContent.textContent.replace("Você: ", ""));
    if (newMessage !== null) {
        messageContent.textContent = `Você: ${newMessage}`;
    }
}

function deleteMessage(msgElement) {
    const confirmDelete = confirm("Tem certeza que deseja cancelar esta mensagem?");
    if (confirmDelete) {
        msgElement.remove();
        emergencyResponse("Mensagem cancelada pelo usuário.");
    }
}

function resendMessage(message) {
    alert(`Mensagem reenviada: "${message}"`);
    emergencyResponse("Mensagem recebida novamente. Estamos analisando.");
}

function makeComplaint() {
    alert("Reclamação registrada. A equipe de emergência foi notificada.");
    emergencyResponse("Reclamação registrada. Agradecemos o feedback.");
}
