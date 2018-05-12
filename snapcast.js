//var connection = new WebSocket('ws://roomberryblue.fritz.box:2027', 'binary');
var connection = new WebSocket('ws://192.168.10.202:1705', 'binary');

connection.binaryType = 'arraybuffer';

var server;

connection.onmessage = function (e) {
 var recv=String.fromCharCode.apply(null, new Uint8Array(e.data));
 // console.log(recv);
  var answer =JSON.parse(recv);
  if(answer.id==1)
   {server=answer.result;}
  // console.log(answer.method);
  if(answer.method=="Client.OnVolumeChanged" || answer.method=="Client.OnLatencyChanged" || answer.method=="Client.OnNameChanged")
   {clientChange(answer.params);}
  if(answer.method=="Client.OnConnect" || answer.method=="Client.OnDisconnect")
   {clientConnect(answer.params);}
  if(answer.method=="Group.OnMute")
   {groupMute(answer.params);}
  if(answer.method=="Group.OnStreamChanged")
   {groupStream(answer.params);}
  if(answer.method=="Stream.OnUpdate")
   {streamUpdate(answer.params);}
  if(answer.method=="Server.OnUpdate")
   {server=answer.params}

show()}

connection.onopen = function() {
send('{"id":1,"jsonrpc":"2.0","method":"Server.GetStatus"}}\n')
}

connection.onerror = function() {
    alert("error");
  }

function send(str)
{
  var buf = new ArrayBuffer(str.length);
  var bufView = new Uint8Array(buf);
  for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }

  //  console.log(buf);
 var recv=String.fromCharCode.apply(null, new Uint8Array(buf));
//  console.log(recv);

  connection.send(buf)

}

function clientChange(params)
{//console.log(params);
var i_group=0
while(i_group<server.server.groups.length)
 {var i_client=0
 while(i_client<server.server.groups[i_group].clients.length)
  {if(server.server.groups[i_group].clients[i_client].id==params.id)
   {//console.log(server.server.groups[i_group].clients[i_client]);
   server.server.groups[i_group].clients[i_client].config=Object.assign(server.server.groups[i_group].clients[i_client].config,params);
   //console.log(server.server.groups[i_group].clients[i_client]);
   }
  i_client++}
 i_group++}
}

function clientConnect(params)
{//console.log(params);
var i_group=0

while(i_group<server.server.groups.length)
 {var i_client=0
while(i_client<server.server.groups[i_group].clients.length)
  {if(server.server.groups[i_group].clients[i_client].id==params.client.id)
   {server.server.groups[i_group].clients[i_client]=params.client;
 //  console.log(server.server.groups[i_group].clients[i_client]);
 }
  i_client++}
 i_group++}
}

function groupMute(params)
{//console.log(params);
var i_group=0

while(i_group<server.server.groups.length)
 {if(server.server.groups[i_group].id==params.id)
   {server.server.groups[i_group].muted=params.mute;
  // console.log(server.server.groups[i_group]);
  }
 i_group++}
}

function groupStream(params)
{//console.log(params);
var i_group=0

while(i_group<server.server.groups.length)
 {if(server.server.groups[i_group].id==params.id)
   {server.server.groups[i_group].stream_id=params.stream_id;
 //  console.log(server.server.groups[i_group]);
 }
 i_group++}
}

function streamUpdate(params)
{//console.log(params);
var i_stream=0

while(i_stream<server.server.streams.length)
 {if(server.server.streams[i_stream].id==params.id)
   {server.server.streams[i_stream]=params.stream;
 //  console.log(server.server.streams[i_stream]);
 }
 i_stream++}
}

function show()
{
 var i_group=0;
var content="";

while(i_group<server.server.groups.length)
 {var i_client=0;
 var unmuted;
 var streamselect="<select id='stream_"+server.server.groups[i_group].id+"' onchange='setStream(\""+server.server.groups[i_group].id+"\")'>"

 var i_stream=0;
 while(i_stream<server.server.streams.length)
 {var streamselected="";
 if (server.server.groups[i_group].stream_id==server.server.streams[i_stream].id) {streamselected='selected'}
streamselect=streamselect+"<option value='"+server.server.streams[i_stream].id+"' "+streamselected+">"+server.server.streams[i_stream].id+": "+server.server.streams[i_stream].status+"</option>";
 i_stream++}
 streamselect=streamselect+"</select>";
 var classgroup='group';
 if (server.server.groups[i_group].muted==true)
 {classgroup='groupmuted'}
content=content+"<div id='g_"+server.server.groups[i_group].id+"' class='"+classgroup+"'>";
content=content+streamselect;

var mutetext;

if (server.server.groups[i_group].muted==true) {unmuted='false';
mutetext='&#x1F507';}
if (server.server.groups[i_group].muted==false) {unmuted='true';
mutetext='&#128266';}

content=content+" <a href=\"javascript:setMuteGroup('"+server.server.groups[i_group].id+"','"+unmuted+"');\" class='mutebuttongroup'>"+mutetext+"</a>";
//content=content+": "+server.server.groups[i_group].muted;
content=content+"<br>";
 while(i_client<server.server.groups[i_group].clients.length)
  {
  var sv=server.server.groups[i_group].clients[i_client];

  var groupselect="<select id='group_"+sv.id+"' onchange='setGroup(\""+sv.id+"\")'>";

  var o_group=0
  while(o_group<server.server.groups.length)
  {var groupselected="";
   if (o_group==i_group) {groupselected='selected'}

  groupselect=groupselect+"<option value='"+server.server.groups[o_group].id+"' "+groupselected+">Group "+o_group+" ("+server.server.groups[o_group].clients.length+" Clients)</option>";
 o_group++
  }
  groupselect=groupselect+"<option value='new'>new</option>";
  groupselect=groupselect+"</select>"

   var name;
   var unmuted;
   if(sv.config.name!="")
	{name=sv.config.name;}
else
{name=sv.host.name;}

var clas='client'
if(sv.connected==false) {clas='disconnected';}

  content=content+"<div id='c_"+sv.id+"' class='"+clas+"'>";


  var mutetextclient;

if (sv.config.volume.muted==true) {unmuted='false';
  mutetext='&#128263';}
if (sv.config.volume.muted==false) {unmuted='true';
  mutetext='&#128266';}
  content=content+" <a href=\"javascript:setVolume('"+sv.id+"','"+unmuted+"');\" class='mutebutton'>"+mutetext+"</a>";
//  content=content+": "+sv.config.volume.muted;

  var sliderclass='slider';
  if (sv.config.volume.muted==true)
  {sliderclass='slidermute';}

  content=content+"<div class='sliderdiv'><input type='range' min=0 max=100 step=1 id='vol_"+sv.id+"' onchange='javascript:setVolume(\""+sv.id+"\",\""+sv.config.volume.muted+"\")' value="+sv.config.volume.percent+" class='"+sliderclass+"'></div>";

  content=content+" <a href=\"javascript:setName('"+sv.id+"');\" class='edit'>&#9998</a>";
  content=content+name;
//  content=content+" Connected:"+sv.connected;
  content=content+groupselect;
  content=content+"</div>";

  i_client++}
  content=content+"</div>"
 i_group++}

 content=content+"<br><br>";



 document.getElementById('show').innerHTML=content;

}

function setVolume(id,mute)
{

percent=document.getElementById('vol_'+id).value;

send('{"id":8,"jsonrpc":"2.0","method":"Client.SetVolume","params":{"id":"'+id+'","volume":{"muted":'+mute+',"percent":'+percent+'}}}}\n')

var i_group=0

while(i_group<server.server.groups.length)
 {var i_client=0
 while(i_client<server.server.groups[i_group].clients.length)
  {var sv=server.server.groups[i_group].clients[i_client];

 if(sv.id==id)
   {if (mute=='true'){sv.config.volume.muted=true;}
   if (mute=='false'){sv.config.volume.muted=false;}
   sv.config.volume.percent=percent;
 //  console.log(server.server.groups[i_group]);
 }

   i_client++}

 i_group++}


show()
}


function setMuteGroup(id,what)
{

send('{"id":"MuteGroup_'+id+'","jsonrpc":"2.0","method":"Group.SetMute","params":{"id":"'+id+'","mute":'+what+'}}}\n')

var i_group=0

while(i_group<server.server.groups.length)
 {if(server.server.groups[i_group].id==id)
   {if (what=='true'){server.server.groups[i_group].muted=true;}
   if (what=='false'){server.server.groups[i_group].muted=false;}
 //  console.log(server.server.groups[i_group]);
 }
 i_group++}
show()
}

function setStream(id)
{

send('{"id":4,"jsonrpc":"2.0","method":"Group.SetStream","params":{"id":"'+id+'","stream_id":"'+document.getElementById('stream_'+id).value+'"}}}\n')

var i_group=0

while(i_group<server.server.groups.length)
 {if(server.server.groups[i_group].id==id)
   {
   server.server.groups[i_group].stream_id=document.getElementById('stream_'+id).value;
 //  console.log(server.server.groups[i_group]);
 }
 i_group++}
show()
}

function setGroup(id)
{group=document.getElementById('group_'+id).value;
var current_group;
var i_group=0

while(i_group<server.server.groups.length)
 {
   var i_client=0
   while(i_client<server.server.groups[i_group].clients.length)
   {if (id==server.server.groups[i_group].clients[i_client].id)
    {current_group=server.server.groups[i_group].id}
   i_client++}
 i_group++}


var send_clients=[];

var i_group=0

while(i_group<server.server.groups.length)
 {if (server.server.groups[i_group].id==group || (group=="new" && server.server.groups[i_group].id==current_group))
   {var i_client=0
   while(i_client<server.server.groups[i_group].clients.length)
   {if (group=="new" && server.server.groups[i_group].clients[i_client].id==id) {}
   else
   {//console.log(group);
   //console.log(server.server.groups[i_group].clients[i_client].id);
   //console.log(id);
   send_clients[send_clients.length]=server.server.groups[i_group].clients[i_client].id;}
   i_client++}
   }
 i_group++}
 if (group!="new")
 {send_clients[send_clients.length]=id;}

var send_clients_string=JSON.stringify(send_clients);
// console.log(send_clients_string);

 var sendgroup=group
 if (group=="new") {group=current_group}

 send('{"id":1,"jsonrpc":"2.0","method":"Group.SetClients","params":{"clients":'+send_clients_string+',"id":"'+group+'"}}}\n')
//send('{"id":1,"jsonrpc":"2.0","method":"Server.GetStatus"}}\n')
}

function setName(id)
{var current_name;
var current_latemcy;
var i_group=0;

while(i_group<server.server.groups.length)
 {var i_client=0
 while(i_client<server.server.groups[i_group].clients.length)
  {var sv=server.server.groups[i_group].clients[i_client];

 if(sv.id==id)
   {
   if(sv.config.name!="")
	{current_name=sv.config.name;}
else
{current_name=sv.host.name;}
   current_latency=sv.config.latency;
   }


   i_client++}

 i_group++}

var newName=window.prompt("New Name",current_name);
var newLatency=window.prompt("New Latency",current_latency);

send('{"id":6,"jsonrpc":"2.0","method":"Client.SetName","params":{"id":"'+id+'","name":"'+newName+'"}}}\n')
send('{"id":7,"jsonrpc":"2.0","method":"Client.SetLatency","params":{"id":"'+id+'","latency":'+newLatency+'}}}\n')

var i_group=0;

while(i_group<server.server.groups.length)
 {var i_client=0
 while(i_client<server.server.groups[i_group].clients.length)
  {var sv=server.server.groups[i_group].clients[i_client];

 if(sv.id==id)
   {
sv.config.name=newName;
   sv.config.latency=newLatency;
   }


   i_client++}

 i_group++}

 show()

}
