const users = []

const addUser = ({ id, username, room }) => {
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validattion
    if (!username || !room) {
        return {
            error: 'Username and Room are required'
        }
    }

    //checking for exixting user
    const existingUser = users.find((user) => {
        return user.username === username && user.room === room
    })

    //validate username
    if (existingUser) {
        return {
            error: 'Username is in use try another nickname'
        }
    }

    //store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    const user = users.find((user) => {
        return user.id === id
    })
    if (!user) {
        return undefined
    }
    return user
}

const getUsersInRoom = (room) => {
    room=room.trim().toLowerCase()
    const Users = users.filter((user) => {
        return user.room === room
    })
    return Users
}

module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom

    
}