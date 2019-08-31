const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)///this line is required to refactor the code such that socket.io able to use it
const io = socketio(server)//socketiois a function which accepts premetive http server 

const port = process.env.PORT || 3000
const public_dir_path = path.join(__dirname, '../public')

app.use(express.static(public_dir_path))/////////set up static dirctory to serve

io.on('connection', (socket) => {
    console.log('new socket connection')

    // socket.emit('display_msg', generateMessage('welcome!!!'))//emits for a specific client in a connection
    // socket.broadcast.emit('display_msg', generateMessage('a new user has joined'))//emit to everybody except for that particular connection

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })
        if (error) {
            return callback(error)
        }
        socket.join(user.room)

        socket.emit('display_msg', generateMessage('Admin', 'welcome!!!'))
        socket.broadcast.to(user.room).emit('display_msg', generateMessage('Admin', `${user.username} has joined`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('profinity not allowed')
        }
        io.to(user.room).emit('display_msg', generateMessage(user.username, message))//emits for all client in a connection
        callback()
    })

    socket.on('sendLocation', (coordinates, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMSG', generateLocationMessage(user.username, `https://google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {/////////////used when a client disconnects
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('display_msg', generateMessage('Admin', `${user.username} has left!!!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    socket.on('isTyping', (callback) => {
        const user = getUser(socket.id)
        socket.broadcast.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room),
            userIsTyping: user.username + ' is typing...'
        })
        callback()
    })

    socket.on('stoppedTyping', (callback) => {
        const user = getUser(socket.id)
        socket.broadcast.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room),
            userIsTyping: ''
        })
        callback()
    })

})

server.listen(port, () => {
    console.log('server started at port = ' + port)
})