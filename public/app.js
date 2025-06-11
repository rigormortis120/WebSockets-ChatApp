const socket= io();

const msgForm = document.getElementById('msgForm');
const msgInput = document.getElementById('msgInput');



const messages = document.getElementById('messages');

const userForm = document.querySelector('.join-form');
const activeUsers=document.getElementById('activeUsers');


const nameInput=document.getElementById('name');
const roomInput=document.getElementById('room');


function enterRoom(e){
    e.preventDefault();
    
    
    if (nameInput.value && roomInput.value){
        socket.emit('enterRoom',{
            name:nameInput.value,
            room:roomInput.value})
        
        socket.emit('userList',{
            name:nameInput.value,
            room:roomInput.value
        })

        
    }
};


msgForm.addEventListener("submit",e=>{
    e.preventDefault();
    
    if (msgInput.value && nameInput.value && roomInput.value){
        socket.emit("message",{
            name:nameInput.value,
            msg:msgInput.value
        });
        msgInput.value="";
        msgInput.focus();
    }
})

socket.on('message',data=>{
    // messages.scrollTo(0, messages.scrollHeight);
    
    // console.log(messages.scrollHeight)
    // messages.scrollTo({ left: 0, bottom:0, behavior: "smooth" });

    const OP=data.split(":")[0];

    const li = document.createElement('li')

    if (OP===nameInput.value){
        li.className="msg msg-sent";
    }
    else{
        li.className="msg msg-incoming";
    }
    li.textContent = data
    document.querySelector('#messages').appendChild(li);
    messages.scrollTop=messages.scrollTopMax;
})


socket.on('userList', data=>{
    let list=[];
    console.log(data);
    data.map(user=>list.push(user.name));
    const userlist = document.createElement('span')
    userlist.textContent = list
    activeUsers.style.display="inline";
    activeUsers.innerText=`ACTIVE USERS IN ROOM: ${list}`;
});

socket.on("adminMsg",(message)=>{
    
    const msg=document.createElement("span");
    msg.textContent=message;
    document.querySelector('#messages').appendChild(msg)
})

userForm.addEventListener("submit",enterRoom);


