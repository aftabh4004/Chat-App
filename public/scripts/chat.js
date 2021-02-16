const socket = io();

// element
const msgDiv = document.getElementById('msgDiv');
const sendBtn = document.getElementById('send');
const msgBox = document.getElementById('msg');
const sentLoc = document.getElementById('send-location');
const sidebar = document.getElementById('sidebar');

// template
const messageTemplate = document.getElementById('message-template').innerHTML;
const locationTemplate = document.getElementById('location-template').innerHTML;
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML;

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });


const autoScroll = () => {
    // New message element
    const newMsg = msgDiv.lastElementChild;

    //Height of new message
    const newMsgStyles = getComputedStyle(newMsg);
    const newMsgMargin = parseInt(newMsgStyles.marginBottom);
    const newMsgHeight = newMsg.offsetHeight + newMsgMargin;

    //visible height
    const visibleHeight = msgDiv.offsetHeight

    // Height of new container 
    const containerHeight = msgDiv.scrollHeight;

    // how far i have scrolled?
    const scrollOffset = msgDiv.scrollTop + visibleHeight;

    if(containerHeight - newMsgHeight <= scrollOffset){
        msgDiv.scrollTop = msgDiv.scrollHeight;
    }



}

socket.on('NewMessage', (msgObj) => {
    console.log("New msg", msgObj);
    const html = Mustache.render(messageTemplate, {
        "username": msgObj.username,
        "message": msgObj.text,
        "createdAt": moment(msgObj.createdAt).format('HH:MM'),
    });
    msgDiv.insertAdjacentHTML('beforeend', html);
    autoScroll();

});

socket.on('displayLocation', (locationObj) => {
    
    const html = Mustache.render(locationTemplate,{
        "username": locationObj.username,
        "latitude": locationObj.latitude,
        "longitude": locationObj.longitude,
        "createdAt": moment(locationObj.createdAt).format('HH:MM')
    });
    msgDiv.insertAdjacentHTML('beforeend', html);
    autoScroll();

});


socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users,
    });
    sidebar.innerHTML = html;
});

sentLoc.addEventListener('click', () => {

    if (!navigator.geolocation) {
        alert("Geolocation is not support by your browser!");
    }

    sentLoc.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        console.log("Location send from client");
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log("Location delivered");
            sentLoc.removeAttribute('disabled');
        });
    });
});

document.querySelector("#msgForm").addEventListener('submit', (e) => {
    e.preventDefault();

    sendBtn.setAttribute('disabled', 'disabled');

    socket.emit('sent', e.target.elements.msg.value, () => {
        console.log("message delivered");
        sendBtn.removeAttribute('disabled');
        e.target.elements.msg.value = "";
        msgBox.focus();
    });
    e.target.elements.msg.value = "";
});


socket.emit('join', { username, room }, ({ error, user }) => {
    if(error){
        alert(error);
        location.href = '/';
    }
    else
        console.log(user, "joined the room!");
});