import { Client } from './js/stomp.js';


const client = new Client({
    brokerURL: 'ws://localhost:7788/wsSmartHome',
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

        client.subscribe('/chrome/tabs', () => {
              getAllTabs();
              async function getAllTabs() {
                  let tabs = await chrome.tabs.query({});
                  client.publish({ destination: '/app/tabs/response', body: JSON.stringify(tabs)});
                  console.log('Date', new Date());
                  console.log('TABS', tabs);
              }
          }
        );
          client.subscribe('/chrome/executeScript', (message) => {

                  // chrome.scripting
                  //     .executeScript({
                  //         target : {tabId : 932214962, allFrames : true},
                  //         files : [ "script.js" ],
                  //     })
                  // .then(() => console.log("script injected in all frames"));
                  let request = JSON.parse(message.body);
                  chrome.scripting
                      .executeScript({
                          target : {tabId : request.id, allFrames : false},
                          func: () => {
                              // write your code here
                              console.log('ABCDS');
                              alert("dakflghdlkfgh'sdlkfg'sdkfgh'sdl;kfgh'sdkfhg;lsdkfhg");
                          },
                      })
                  .then(() => console.log("script injected in all frames"));


                  // chrome.tabs
                  //     .executeScript({
                  //         target : {tabId : 932214648, allFrames : true},
                  //         files : [ "script.js" ],
                  //     })
                  // .then(() => console.log("script injected in all frames"));


                  // getTab();

                  // async function getTab() {
                  //     // let tab = await chrome.tabs.query({id: 932214648});
                  //     // chrome.tabs.executeScript(932214648, {
                  //     //     file: './script.js'
                  //     // });
                  //     chrome.scripting.executeScript({
                  //         target: {tabId: 932214648, allFrames: true},
                  //         files: ['./script.js'],
                  //     });
                  //
                  //     console.log('TAB', tab);
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
      },
});
client.reconnectDelay = 300;
client.activate();

const keepAlive = () => setInterval(chrome.runtime.getPlatformInfo, 20e3);
chrome.runtime.onStartup.addListener(keepAlive);
keepAlive();

