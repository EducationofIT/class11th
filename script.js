import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
getDatabase,
ref,
push,
set,
onChildAdded,
onChildChanged,
onValue,
update,
remove,
onDisconnect
}
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig={
apiKey:"AIzaSyAE5rQl0HyT3M7z_Bbai62UBN2-yXjn6D4",
authDomain:"chatapp-e2f26.firebaseapp.com",
databaseURL:"https://chatapp-e2f26-default-rtdb.firebaseio.com",
projectId:"chatapp-e2f26"
};

const app=initializeApp(firebaseConfig);
const db=getDatabase(app);

let username="";
let chatID="";
let userId="";
let profileImage="pro.png";

// BUTTON EVENTS
document.getElementById("joinBtn").addEventListener("click", joinChat);
document.getElementById("sendBtn").addEventListener("click", sendMessage);
document.getElementById("message").addEventListener("input", typing);

// CHANGE PROFILE
document.getElementById("changeProfile").addEventListener("change", e=>{

const file=e.target.files[0];
if(!file) return;

const reader=new FileReader();

reader.onload=()=>{

profileImage=reader.result;

document.getElementById("profilePic").src=profileImage;

update(ref(db,"online/"+chatID+"/"+userId),{
name:username,
profile:profileImage
});

};

reader.readAsDataURL(file);

});

// JOIN CHAT
function joinChat(){

username=document.getElementById("username").value.trim();
chatID=document.getElementById("chat-id").value.trim();

if(!username||!chatID){

alert("Enter details");
return;

}

document.getElementById("setup").style.display="none";
document.getElementById("chat").style.display="flex";

document.getElementById("roomName").innerText=chatID;

userId=Date.now();

const userRef=ref(db,"online/"+chatID+"/"+userId);

set(userRef,{
name:username,
profile:profileImage
});

onDisconnect(userRef).remove();

listenOnline();
listenMessages();
listenTyping();

}

// SEND MESSAGE
function sendMessage(){

const input=document.getElementById("message");

if(!input.value) return;

const msgRef=push(ref(db,"chats/"+chatID));

set(msgRef,{
user:username,
text:input.value,
seen:false,
id:msgRef.key
});

input.value="";

}

// TYPING
function typing(){

set(ref(db,"typing/"+chatID+"/"+userId),username);

setTimeout(()=>{
remove(ref(db,"typing/"+chatID+"/"+userId));
},2000);

}

// ONLINE COUNT
function listenOnline(){

onValue(ref(db,"online/"+chatID),snap=>{

let count=0;
snap.forEach(()=>count++);

document.getElementById("onlineCount").innerText=count+" Online";

});

}

// LISTEN MESSAGES
function listenMessages(){

onChildAdded(ref(db,"chats/"+chatID),snap=>{

const data=snap.val();

if(data.user!==username){

update(ref(db,"chats/"+chatID+"/"+data.id),{
seen:true
});

}

addMessage(data);

});

onChildChanged(ref(db,"chats/"+chatID),snap=>{

const data=snap.val();

const el=document.getElementById(data.id);

if(el) el.outerHTML=createMessage(data);

});

}

function addMessage(data){

document.getElementById("messages")
.innerHTML+=createMessage(data);

}

function createMessage(data){

return `

<div class="msg ${data.user===username?'me':''}" id="${data.id}">
<div class="bubble">
${data.text}
<div class="tick">
${data.user===username?(data.seen?"✓✓ Seen":"✓ Sent"):""}
</div>
</div>
</div>
`;

}

// LISTEN TYPING
function listenTyping(){

onValue(ref(db,"typing/"+chatID),snap=>{

let text="";

snap.forEach(child=>{
if(child.val()!==username)
text=child.val()+" typing...";
});

document.getElementById("typingStatus").innerText=text;

});

}
