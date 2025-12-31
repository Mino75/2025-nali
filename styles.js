(function(){
const style=document.createElement("style");
style.innerHTML=`

*{box-sizing:border-box;margin:0;padding:0}

html,body{
  width:100%;
  height:100%;
  background:#111;
  color:#eee;
  font-family:Segoe UI,Arial;
}

/* Fullscreen map */
#map{
  width:100%;
  height:100vh;
}

/* Burger button */
#burger-btn{
  position:fixed;
  top:10px;
  left:10px;
  z-index:11000;
  font-size:24px;
  padding:10px 14px;
  border:none;
  border-radius:6px;
  background:#000000aa;
  color:#fff;
  cursor:pointer;
}

/* Compass overlay */
#compassOverlay{
  position:fixed;
  top:10px;
  right:10px;
  width:80px;
  height:80px;
  background:#ffffffcc;
  color:#000;
  border-radius:50%;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:20px;
  z-index:11000;
}

/* Modal base */
.modal{
  display:none;
  position:fixed;
  left:0;
  top:0;
  width:100%;
  height:100%;
  background:rgba(0,0,0,.85);
  z-index:10000;
  backdrop-filter:blur(6px);
}

/* Modal content */
.modal-content{
  width:90%;
  max-width:600px;
  margin:5% auto;
  padding:20px;
  background:#181818;
  color:#fff;
  border-radius:12px;
  max-height:90%;
  overflow-y:auto;
}

/* Buttons */
button{
  width:100%;
  padding:14px;
  margin:8px 0;
  border:none;
  border-radius:8px;
  background:#222;
  color:#fff;
  font-size:16px;
}

button:hover{
  background:#333;
}

.close{
  float:right;
  font-size:28px;
  cursor:pointer;
}

/* Data text */
#dataDisplay{
  margin-top:15px;
  font-family:monospace;
  white-space:pre-wrap;
}

/* Mobile first */
@media(max-width:768px){
  #map{height:100vh}
}
`;
document.head.appendChild(style);
})();
