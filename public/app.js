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
    //get name input for later use
    //msgActivity=document.getElementById('msgActivity');
    
    
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


socket.on("enableMsg",()=>{
    //ATTRIBUTE ENABLE INPUT
    msgInput.removeAttribute("disabled");
    msgInput.setAttribute("placeholder","Send a message...");
})

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
console.log(data);
    
    const messageBox = document.createElement('div');

    const OP= document.createElement('p');
    OP.textContent=data.name;
    OP.className="op";

    const content= document.createElement('p');
    content.textContent=data.msg;
    content.className="m-content"


    if (data.name===nameInput.value){
        messageBox.className="msg msg-sent";
    }
    else{
        messageBox.className="msg msg-incoming";
    }
    messageBox.appendChild(OP);
    messageBox.appendChild(content);
    messages.insertBefore(messageBox,msgActivity);
    messages.scrollTop=messages.scrollTopMax;
})


socket.on('userList', data=>{
    let list=[];
    console.log(data);
    data.map(user=>list.push(user.name));
    const userlist = document.createElement('span')
    userlist.textContent = list
    activeUsers.style.display="inline";
    activeUsers.innerText=`Active users in this room: ${list}`;
});

socket.on("adminMsg",(message)=>{
    
    const msg=document.createElement("span");
    msg.textContent=message;
    messages.insertBefore(msg,msgActivity);
})

userForm.addEventListener("submit",enterRoom);

//ACTIVITY TIMER FOR MESSAGES
msgInput.addEventListener("keypress",()=>{
    socket.emit('activity', nameInput.value)
})


let activityTimer
socket.on("activity", (name) => {
    
    //dont send back to user
    if (name!==nameInput.value){
            //1. put text that its typing
            msgActivity.textContent = `${name} is typing...`;
            //2. make it visible
            msgActivity.style.display="inline";

            //3. on timeout, remove
            
                // Clear after 3 seconds 
                clearTimeout(activityTimer)
                activityTimer = setTimeout(() => {
                    msgActivity.style.display="none";
                }, 3000)
}
})


