import express from 'express'
import { Server } from "socket.io"
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT || 3500

const app = express()

app.use(express.static(path.join(__dirname, "public")))

const expressServer = app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})

const io = new Server(expressServer, {
    cors: {
        origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5500", "http://127.0.0.1:5500"]
    }
})

// USER FUNCTIONS
const UsersState={
    users:[],
    setUsers: function(newArray){
        this.users=newArray;
    }
}

function activateUser(id,name,room){
    const user={id,name,room};
    UsersState.setUsers([
        ...UsersState.users.filter(user=>user.id!==id),
        user
    ])
    return user;
};

function getUser(id) {
    return UsersState.users.find(user => user.id === id)
};

function userAppDisconnect(id){
    UsersState.setUsers(UsersState.users.filter(user=>user.id!==id));
};

function getUsersInRoom(room){
    return UsersState.users.filter(user=>user.room===room);
};

io.on('connection', socket => {
    console.log(`User ${socket.id} connected`)

    socket.on('message', ({name,msg}) => {
        const data={name,msg};
        const room = getUser(socket.id)?.room
        io.to(room).emit('message', data)
    });


    //IF TYPING, DISPLAY ACTIVITY
    socket.on("activity",(name)=>{
            console.log(name);
            const room = getUser(socket.id)?.room
            io.to(room).emit('activity', name)
    })

    socket.on('enterRoom', ({name,room})=>{
            
            
        //CHECK IF USER WAS IN A PREVIOUS ROOM AND LEAVE IF SO ......more
        const prevRoom=getUser(socket.id)?.room;
        if(prevRoom){
            socket.leave(prevRoom);
        }


        //ACTIVATE THE USER AND JOIN ROOM
        const user=activateUser(socket.id,name,room);
        socket.join(room);
        //ENABLE THE MESSAGE INPUT
        socket.emit("enableMsg");

        //NOTIFY ROOM
        io.to(room).emit("adminMsg", `User ${name} has joined the room`);

        //UPDATE USER LIST FOR PREVIOUS ROOM IF EXISTS
        if(prevRoom){
           io.to(prevRoom).emit('userList',getUsersInRoom(prevRoom))
        }

        //UPDATE USER LIST FOR CURRENT ROOM
        io.to(room).emit('userList',getUsersInRoom(user.room))
        console.log(`${name} joined room ${room}`)

        

    //USER DISCONNECTS
    socket.on('disconnect',()=>{
        //GET USER INFO BEFORE DISCONNECTING
        const user=getUser(socket.id);
        userAppDisconnect(socket.id)

        if (user){
            //NOTIFY USERS THAT SOMEONE LEFT
            io.to(user.room).emit("adminMsg", `User ${user.name} has left the room`);
            //UPDATE USER LIST OF ROOM
            io.to(user.room).emit("userList", getUsersInRoom(user.room));
        }
    })
        
        // socket.broadcast.to(room).emit('message',`${name} has joined the room`);
    })
    

})