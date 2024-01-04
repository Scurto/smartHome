import { Client } from './js/stomp.js';


const client = new Client({
    brokerURL: 'ws://localhost:7788/gs-guide-websocket',
      onConnect: () => {
        client.subscribe('/topic/greetings', message => {
            console.log(chrome.tabs);
            console.log(`Received: ${message.body}`);

            // getCurrentTab();
            // async function getCurrentTab() {
            //   let queryOptions = { active: true, lastFocusedWindow: true };
            //   // `tab` will either be a `tabs.Tab` instance or `undefined`.
            //   let [tab] = await chrome.tabs.query(queryOptions);
            //   console.log(tab);
            //   return tab;
            // }


            // moveToTab(207377424);

            // console.log("1");
            // chrome.tabs.query({}, function(tabs) {
            //   tabs.forEach(function (tab) {
            //     console.log('tab', tab);
            //     // chrome.tabs.executeScript(tab.id, {code:"document.title = 'My lame title!'"});
            //   });
            // });

            getAllTabs();
            async function getAllTabs() {
                let tabs = await chrome.tabs.query({});
                client.publish({ destination: '/app/tabs/response', body: JSON.stringify(tabs) });
                console.log('Date', new Date());
                console.log('TABS', tabs);
            }

            // console.log("2");
            // async function moveToTab(tabId) {
            //   await chrome.tabs.move(tabId, {index: 0});
            //   console.log("Success.");
            // }
          }
        );
        client.subscribe('/topic/greetings2', message => {
            console.log("greetings2");

            // var tabs = await chrome.tabs.query({});
            // tabs.forEach(function (tab) {
            //   // do whatever you want with the tab
            // });


            // chrome.tabs.query({}, function(tabs) {
            //   tabs.forEach(function (tab) {
            //     console.log('tab', tab.url);
            //   });
            // });

            console.log(getCurrentTabUrl());

            async function getCurrentTabUrl () {
              const tabs = await chrome.tabs.query({ active: true })
              return tabs[0].url;
            }
          }
        );
        client.subscribe('/topic/greetings3', message => {
          console.log("greetings3");
          // getCurrentTabUrl();

          // async function getCurrentTabUrl () {
          //   const tabs = await chrome.tabs.query({ active: true })
          //   console.log('url', tabs[0].url);
          //   return tabs[0].url;
          // }
          chrome.windows.getAll({populate:true},function(windows){
            windows.forEach(function(window){
              window.tabs.forEach(function(tab){
                //collect all of the urls here, I will just log them instead
                console.log(tab);
              });
            });
          });
        }
        );
      },
});
client.reconnectDelay = 300;
client.activate();

const keepAlive = () => setInterval(chrome.runtime.getPlatformInfo, 20e3);
chrome.runtime.onStartup.addListener(keepAlive);
keepAlive();

// const stompClient = new StompJs.Client({
//   brokerURL: 'ws://localhost:8080/gs-guide-websocket'
// });

// let webSocket = new WebSocket("ws://localhost:8080/gs-guide-websocket");
// webSocket.onopen = function(e) {
//   console.log('test');
// };
// webSocket.onmessage = (event) => {
//   console.log('message -> ' + event.data);
// };

// stompClient.activate();

// stompClient.onConnect = (frame) => {
//   // setConnected(true);
//   console.log('Connected: ' + frame);
//   stompClient.subscribe('/topic/greetings', (greeting) => {
//     console.log("message -> " + JSON.parse(greeting.body).content);
//   });
// };

// stompClient.onWebSocketError = (error) => {
//   console.error('Error with websocket', error);
// };

// stompClient.onStompError = (frame) => {
//   console.error('Broker reported error: ' + frame.headers['message']);
//   console.error('Additional details: ' + frame.body);
// };

// function setConnected(connected) {
//   $("#connect").prop("disabled", connected);
//   $("#disconnect").prop("disabled", !connected);
//   if (connected) {
//       $("#conversation").show();
//   }
//   else {
//       $("#conversation").hide();
//   }
//   $("#greetings").html("");
// }

// function connect() {
  
// }

// function disconnect() {
//   stompClient.deactivate();
//   setConnected(false);
//   console.log("Disconnected");
// }

// function sendName() {
//   stompClient.publish({
//       destination: "/app/hello",
//       body: JSON.stringify({'name': $("#name").val()})
//   });
// }

// function showGreeting(message) {
//   $("#greetings").append("<tr><td>" + message + "</td></tr>");
// }

// $(function () {
//   $("form").on('submit', (e) => e.preventDefault());
//   $( "#connect" ).click(() => connect());
//   $( "#disconnect" ).click(() => disconnect());
//   $( "#send" ).click(() => sendName());
// });

