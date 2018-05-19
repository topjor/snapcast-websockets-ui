SnapCast Manager (web userinterface)
======

This is a web gui manager for [SnapCast](https://github.com/badaix/snapcast).  
The gui is build on top of [Semantic UI](https://semantic-ui.com/) (css and js framework) with slate theme (from http://semantic-ui-forest.com/)  
The base layout was inspired by the android app, and this gui is also made with mobile use in mind.

## Features
- Group management
  - change stream
  - mute
- client management
  - change name
  - change latency
  - change volume
  - mute
  - ~~change group - Not implemented yet~~

## Instructions
For the gui to work, you need a server component that translates the raw tcp jsonrpc to jsonrpc over a WebSocket, for example [Websockify](https://github.com/novnc/websockify)  
(run websockify with `./run 2705 <ip>:1705`, where ip is left blank for localhost or the address of the snapcast server)

After installing a websocket server just open the `interface2.html` page (or upload it to a webserver)  

if you run the websocket server on a different host (or port) then locally, edit the `snapcast2.js` file and change the websocket like `ws://<ip>:2705` (line 7).

## Credits
Special thanks to [derglaus](https://github.com/derglaus) for his [snapcast-websockets-ui](https://github.com/derglaus/snapcast-websockets-ui)!  
I forked this first but quickly started my own version, based on his javascript work,  
the handeling of the websocket (send, receive and onmessage) is copied, the rest I reimplemented from his version.  
(I updated the handling of split/chunked messages)
