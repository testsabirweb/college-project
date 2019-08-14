const socket = io()

///         ELEMENTS
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('#send')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

///         TEMPLATES
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

///         options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    ///new message element
    const $newMessage = $messages.lastElementChild

    ///height of new message
    const newMessageStyles = getComputedStyle($newMessage)//gives all the css property like margin color font etc..
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    ///visible height
    const visibleHeight = $messages.offsetHeight

    ///height of message container
    const containerHeight = $messages.scrollHeight

    ///how far have i scrolled 
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('display_msg', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        msg: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMSG', (message) => {
    console.log(message)
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        loc: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')//disabling button

    let message = e.target.elements.msg.value

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')//enabling button
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if (error) {
            return console.log(error)
        }
        console.log('message deliverd...')
    })
})

$sendLocationButton.addEventListener('click', (e) => {
    if (!navigator.geolocation) {
        return alert('geolocation is not supported by your browser...')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')//disable
    navigator.geolocation.getCurrentPosition((position) => {//geolocation does not support promises so a simple callback is used instead of async and await
        let coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        socket.emit('sendLocation', coordinates, () => {
            $sendLocationButton.removeAttribute('disabled')//enable
            console.log('location shared')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'////location is a global variable 
    }
})
