var streams = [];
var connection;

$(document).ready(function() {
    // open connection
    window.connection = new WebSocket('ws://localhost:2705', 'binary');

    window.connection.binaryType = 'arraybuffer';

    // handle messages
    window.connection.onmessage = function(e) {
        // get data
        var recv = String.fromCharCode.apply(null, new Uint8Array(e.data));
        // parse json
        var answer = JSON.parse(recv);
        console.log(answer);
        if (answer.id == 1) {
            serverUpdate(answer.result);
        }
        // client updates
        if (answer.method == "Client.OnVolumeChanged" || answer.method == "Client.OnLatencyChanged") {
            updateClientMute(answer.params);
            updateClientVolume(answer.params);
        } else if (answer.method == "Client.OnNameChanged") {
            updateClientName(answer.params);
        }
        if (answer.method == "Client.OnConnect") {
            clientConnect(answer.params);
        } else if(answer.method == "Client.OnDisconnect") {
            clientDisconnect(answer.params);
        }
        if (answer.method == "Group.OnMute") {
            updateGroupMute(answer.params);
        }
        if (answer.method == "Group.OnStreamChanged") {
            updateGroupStream(answer.params);
        }
        if (answer.method == "Stream.OnUpdate") {
            streamUpdate(answer.params);
        }
        if (answer.method == "Server.OnUpdate") {
            server = answer.params;
        }
    };

    // on connection open, send call to receive all info
    window.connection.onopen = function() {
        send('{"id":1,"jsonrpc":"2.0","method":"Server.GetStatus"}}\n');
    };

    // on connection errors
    window.connection.onerror = function() {
        $("#serverName").html("Disconnected");
        alert("error");
    };
});

// send function
function send(str) {
    var buf = new ArrayBuffer(str.length);
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    //  console.log(buf);
    var recv = String.fromCharCode.apply(null, new Uint8Array(buf));
    //  console.log(recv);
    window.connection.send(buf)

}

// server update function
function serverUpdate(params) {
    $("#serverName").html(params.server.server.host.name);
    updateStreams(params.server.streams);
    updateGroups(params.server.groups);
}

function updateStreams(params) {
    console.log(params);
    window.streams = params;
}

// update all groups
function updateGroups(params) {
    for (var i = 0; i < params.length; i++) {
        updateGroup(params[i]);
    }
}

// update a group
function updateGroup(params) {
    // update if exists
    group = $("#groups").find("#g_"+params.id);
    if (group.length != 0) {

    // insert if not
    } else {
        // open group segment
        html  = "<div class=\"ui segment\" id=\"g_"+ params.id +"\">";
        // open group controlls
        html +=   "<div class=\"ui form\"><div class=\"fields\">";

        // group stream select
        html +=     "<div class=\"field\"><select class=\"ui dropdown\" id='s_" + params.id + "' onchange='setGroupStream(\"" + params.id + "\")'>";
        // loop through streams
        for (var j = 0; j < window.streams.length; j++) {
            // set easy to use var
            var stream = window.streams[j];

            // find out if its the active stream for this group
            var selected = "";
            if (stream.id == params.stream_id) {
                selected = "selected";
            }

            // insert the option
            html +=   "<option value=\""+stream.id+"\" "+selected+">"+stream.id+" : "+stream.status+"</option>";
        }
        html +=     "</select></div>";

        // group mute button
        var mutetext;
        var unmuted;
        if (params.muted == true) {
            unmuted = 'false';
            mutetext = 'volume off';
        } else {
            unmuted = 'true';
            mutetext = 'volume up';
        }
        html +=     "<a id=\"groupmute\" href=\"javascript:setGroupMute('" + params.id + "','" + unmuted + "');\" class='ui basic circular icon button'><i class=\"ui icon " + mutetext + "\"></i></a>";

        // end of stream controlls
        html +=   "</div></div>";

        // divider
        html +=   "<div class=\"ui divider\"></div>";

        // open client list
        html +=   "<div class=\"ui items\">";
        // loop through clients
        for (var k = 0; k < params.clients.length; k++) {
            // set easy to use var
            client = params.clients[k];

            // disconnect check
            var state = "";
            if (client.connected == false) {
                state = "state=\"disconnected\"";
            }

            // start client
            html += "<div id=\"c_"+ client.id.replace(/:/g,'-') +"\" class=\"item client\" "+ state +"><div class=\"content\">";

            // client name
            name = client.config.name;
            if (name == "") name = client.host.name;
            html +=   "<div class=\"header\"><span id=\"clientName\">"+ name +"</span>&nbsp;&nbsp;&nbsp;&nbsp;<a href=\"javascript:editClientName('"+ client.id +"', '"+ name +"');\"><i class=\"ui icon edit outline\"></i></a></div>";
            // mute - volume - edit
            html +=   "<div class=\"description\">";
            // open client controlls
            html +=     "<div class=\"ui form\"><div class=\"fields\">";
            // client mute button
            var mutetext;
            var unmuted;
            if (client.config.volume.muted == true) {
                unmuted = 'false';
                mutetext = 'volume off';
            } else {
                unmuted = 'true';
                mutetext = 'volume up';
            }
            html +=       "<a id=\"clientmute\" href=\"javascript:setClientMute('"+ client.id +"','"+ unmuted +"');\" class='ui basic circular icon button'><i class=\"ui icon "+ mutetext +"\"></i></a>";

            // volume slider
            html +=       "<div id=\"clientvolumeslider\" class=\"ui grey range\" value=\""+ client.config.volume.percent +"\"></div>";
            html +=       "<input id=\"clientvolume\" type=\"hidden\" value=\""+ client.config.volume.percent +"\"/>"
            html +=       "<input id=\"clientid\" type=\"hidden\" value=\""+ client.id +"\" />";

            // edit button
            html +=       "<a id=\"clientlatency\" href=\"javascript:editClientLatency('"+ client.id +"');\" class='ui basic circular icon button'><i class=\"ui icon cog \"></i></a>";

            // end of controlls
            html +=     "</div></div>";
            html +=   "</div>";
            // close client
            html += "</div></div>";
        }
        // close client list
        html +=   "</div>";

        // close group
        html += "</div>";

        $("#groups").append(html);

        easyElem();
    }
}

// group mute update
function updateGroupMute(params) {
    var unmuted = 'true';
    var mutetext = 'volume up';
    if (params.mute == true || params.mute == 'true') {
        unmuted = 'false';
        mutetext = 'volume off';
    }

    $("#g_"+params.id).find("#groupmute").attr("href", "javascript:setGroupMute('" + params.id + "','" + unmuted + "');")
                                         .find("i").attr("class", "ui icon "+ mutetext);
}

// group stream update
function updateGroupStream(params) {
    $("#s_"+ params.id).dropdown('set selected', params.stream_id);
}

// client mute update
function updateClientMute(params) {
    var unmuted = 'true';
    var mutetext = 'volume up';
    if (params.volume.muted == true || params.volume.muted == 'true') {
        unmuted = 'false';
        mutetext = 'volume off';
    }
    $("#c_"+params.id.replace(/:/g,'-')).find("#clientmute").attr("href", "javascript:setClientMute('"+ params.id +"','"+ unmuted +"');")
                                                            .find("i").attr("class", "ui icon "+ mutetext);
}

// client volume update
function updateClientVolume(params) {
    $("#c_"+params.id.replace(/:/g,'-')).find("#clientvolumeslider").range("set value", params.volume.percent);
}

// client name update
function updateClientName(params) {
    $("#c_"+params.id.replace(/:/g, '-')).find("#clientName").html(params.name);
}



// set group mute
function setGroupMute(group, mute) {
    send('{"id":5,"jsonrpc":"2.0","method":"Group.SetMute","params":{"id":"' + group + '","mute":' + mute + '}}}\n');
    updateGroupMute({"id": group, "mute": mute});
}

// set group stream
function setGroupStream(group) {
    stream = $("#s_" + group).val();
    send('{"id":4,"jsonrpc":"2.0","method":"Group.SetStream","params":{"id":"' + group + '","stream_id":"' + stream + '"}}}\n')
}

// set client mute
function setClientMute(client, mute) {
    volume = $("#c_"+ client.replace(/:/g, '-')).find("#clientvolume").val();
    send('{"id":8,"jsonrpc":"2.0","method":"Client.SetVolume","params":{"id":"' + client + '","volume":{"muted":' + mute + ',"percent":' + volume + '}}}}\n');
    updateClientMute({'id': client, 'volume': {'muted': mute}});
}

// set client volume
function setClientVolume(client, volume) {
  send('{"id":8,"jsonrpc":"2.0","method":"Client.SetVolume","params":{"id":"' + client + '","volume":{"muted": false,"percent":' + volume + '}}}}\n')
  updateClientVolume({"id": client, "volume": {"muted": false, "percent": volume}});
  updateClientMute({"id": client, "volume": {"muted": false, "percent": volume}});
}


// update dialog
function editClientName(client, clientName) {
    $("#clientEdit").modal({
        onApprove: function() {
          clientId = $("#clientEdit").find("#clientId").val();
          newClientName = $("#clientEdit").find("#newClientName").val();
          send('{"id":6,"jsonrpc":"2.0","method":"Client.SetName","params":{"id":"' + clientId + '","name":"' + newClientName + '"}}}\n');
          updateClientName({'id': clientId, 'name': newClientName});
      }
    });
    $("#clientEdit").modal("show");
    $("#clientEdit").find(".sub.header").html(client);
    $("#clientEdit").find("#clientId").val(client);
    $("#clientEdit").find("#newClientName").val(clientName);
}

function clientDisconnect(client) {
    $("#c_"+ client.id.replace(/:/g, '-')).dimmer("show");
}
function clientConnect(client) {
    $("#c_"+ client.id.replace(/:/g, '-')).dimmer("hide");
}

function easyElem() {
    $(".ui.dropdown").each(function() {
        $(this).dropdown();
    });
    $(".ui.accordion").each(function() {
        $(this).accordion();
    });
    $(".ui.checkbox").each(function() {
        $(this).checkbox();
    });

    $(".ui.range").each(function() {
        $(this).range({
            min: 0,
            max: 100,
            start: $(this).attr("value"),
            input: $(this).parent().find("#clientvolume"),
            onChange: function(val, meta) {
                if(meta.triggeredByUser) {
                    input = this.input;
                    cid = $(input).parent().find("#clientid").val();
                    setClientVolume(cid, val);
                }
            }
        });
    });

    $(".client").each(function() {
        $(this).dimmer({'closable': false});
    });

    $("[state=\"disconnected\"]").each(function() {
        $(this).dimmer("show");
        $(this).attr("state", "");
    });
}