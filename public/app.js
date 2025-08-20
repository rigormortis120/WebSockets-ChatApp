const socket= io();

const greet=document.getElementById("greet");
const topLine=document.getElementById("top-line");
const exitBtn=document.getElementsByClassName("exit-btn")[0];


const msgForm = document.getElementById('msgForm');
const msgInput = document.getElementById('msgInput');



const messages = document.getElementById('messages');

const userForm = document.querySelector('.join-form');
const activeUsers=document.getElementById('activeUsers');


const nameInput=document.getElementById('name');
const roomInput=document.getElementById('room');


function enterRoom(e){
    e.preventDefault();
    
    topLine.style.translate="0";
    
    
    greet.style.translate="0 -800px";
    
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


socket.on("userCount",(num)=>{
    document.getElementById("user-count").textContent=`There are ${num} users currently active`
    
})

socket.on("enableMsg",()=>{
    //ATTRIBUTE ENABLE INPUT
    msgInput.removeAttribute("disabled");
    msgInput.setAttribute("placeholder","Send a message...");
    msgInput.focus();
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
    const now = new Date();
    // messages.scrollTo(0, messages.scrollHeight);
    
    // console.log(messages.scrollHeight)
    // messages.scrollTo({ left: 0, bottom:0, behavior: "smooth" });
console.log(data);
    //CREATING A MESSAGE
    const messageBox = document.createElement('div');

    const messageInner= document.createElement('div');

    const OP= document.createElement('p');
    OP.textContent=data.name;
    OP.className="op";

    const content= document.createElement('p');
    content.textContent=data.msg;
    content.className="m-content";

    const time_msg= document.createElement('p');
    time_msg.textContent=now.getHours().toString()+":"+now.getMinutes().toString().padStart(2, '0');   
    time_msg.className="m-time";

    //STYLING MESSAGE
    messageInner.className="msg-inner";
    if (data.name===nameInput.value){
        messageBox.className="msg msg-sent";
    }
    else{
        messageBox.className="msg msg-incoming";
    }


    messageInner.appendChild(OP);
    messageInner.appendChild(content);
    messageBox.appendChild(messageInner);
    messageBox.appendChild(time_msg);
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


msgInput.addEventListener("submit",()=>{
    clearTimeout(activityTimer)
            activityTimer = setTimeout(() => {
                msgActivity.style.display="none";
             }, 0)
});


exitBtn.addEventListener("click",()=>{
    
    socket.emit("leaveRoom",{
        name:nameInput.value,
        room:roomInput.value
    })

   
})


socket.on("leaveRoom",()=>{
    msgInput.setAttribute("disabled",1);
    msgInput.setAttribute("placeholder","Join a room first");
    activeUsers.innerText="";
    topLine.style.translate="-1200px";
    greet.style.translate="0 0";
    while(document.getElementsByClassName("msg").length!==0) document.getElementsByClassName("msg")[0].remove();
    while(document.getElementsByTagName("span").length!==0) document.getElementsByTagName("span")[0].remove();
})




