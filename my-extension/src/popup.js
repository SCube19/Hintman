'use strict';

import './popup.css';
import "p5";
import p5 from 'p5';


(function() {
    // We will make use of Storage API to get and store `count` value
    // More information on Storage API can we found at
    // https://developer.chrome.com/extensions/storage

    // To get storage access, we have to mention it in `permissions` property of manifest.json file
    // More information on Permissions can we found at
    // https://developer.chrome.com/extensions/declare_permissions
    const counterStorage = {
        get: (cb) => {
            chrome.storage.sync.get(['count'], (result) => {
                cb(result.count);
            });
        },
        set: (value, cb) => {
            chrome.storage.sync.set({
                    count: value,
                },
                () => {
                    cb();
                }
            );
        },
    };

    function setupCounter(initialValue = 0) {
        document.getElementById('counter').innerHTML = initialValue;

        document.getElementById('incrementBtn').addEventListener('click', () => {
            updateCounter({
                type: 'INCREMENT',
            });
        });

        document.getElementById('decrementBtn').addEventListener('click', () => {
            updateCounter({
                type: 'DECREMENT',
            });
        });
    }

    function updateCounter({ type }) {
        counterStorage.get((count) => {
            let newCount;

            if (type === 'INCREMENT') {
                newCount = count + 1;
            } else if (type === 'DECREMENT') {
                newCount = count - 1;
            } else {
                newCount = count;
            }

            counterStorage.set(newCount, () => {
                document.getElementById('counter').innerHTML = newCount;

                // Communicate with content script of
                // active tab by sending a message
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    const tab = tabs[0];

                    chrome.tabs.sendMessage(
                        tab.id, {
                            type: 'COUNT',
                            payload: {
                                count: newCount,
                            },
                        },
                        (response) => {
                            console.log('Current count value passed to contentScript file');
                            console.log(response);
                        }
                    );
                });
            });
        });
    }

    function restoreCounter() {
        // Restore count value
        counterStorage.get((count) => {
            if (typeof count === 'undefined') {
                // Set counter value as 0
                counterStorage.set(0, () => {
                    setupCounter(0);
                });
            } else {
                setupCounter(count);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', restoreCounter);


    function startFunction() {
        // Communicate with content script of
        // active tab by sending a message
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];

            chrome.tabs.sendMessage(
                tab.id, { type: 'URL' },
                (response) => {
                    console.log('GOT RESPONSE URL: ' + response.url);
                    document.getElementById("website_url").innerText = response.url;
                }
            );
        });
    }


    document.addEventListener('DOMContentLoaded', startFunction);

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'POST') {
            console.log(`CAUGHT POST FROM BACKGROUND -> THIS IS "POST" ;D -> SURELY NOT UNDEFINED ->>>> ${request}`);
            sendResponse({});
            return true;
        }
    });

    // Communicate with background file by sending a message
    // chrome.runtime.sendMessage(
    //   {
    //     type: 'GREETINGS',
    //     payload: {
    //       message: 'Hello, my name is Pop. I am from Popup.',
    //     },
    //   },
    //   (response) => {
    //     console.log(response.message);
    //   }
    // );
})();












///////////////////////// CANVAS.JS ////////////////////////////////
const size = 350;

let color = 'Black';
let tool = 'triangle';
let weight = 10;

let s = (P5) => {
    P5.setup = () => {
        //document.body.userSelect['userSelect'] = 'none';
        let canvas = P5.createCanvas(size, size);
        P5.background(200);
        canvas.style('pointer-events', 'none');
    }

    P5.draw = () => {
        P5.stroke(color);
        P5.strokeWeight(weight);
        if (P5.mouseIsPressed) {
            switch (tool) {
                case 'pencil':
                    P5.line(P5.mouseX, P5.mouseY, P5.pmouseX, P5.pmouseY);
                    break;
                case 'rect':
                    P5.rect(P5.mouseX - weight / 2, P5.mouseY - weight / 2, weight, weight);
                    break;
                case 'circle':
                    P5.circle(P5.mouseX, P5.mouseY, weight);
                    break;
                case 'triangle':
                    P5.triangle(P5.mouseX - Math.sqrt(3) / 2 * weight, P5.mouseY + weight / 2,
                        P5.mouseX, P5.mouseY - weight,
                        P5.mouseX + Math.sqrt(3) / 2 * weight, P5.mouseY + weight / 2
                    );
                    //console.log(`${P5.mouseX - Math.sqrt(3) / 2 * weight} ${P5.mouseY + weight / 2} ${P5.moouseX} ${P5.mouseY + weight} ${P5.mouseX + Math.sqrt(3) / 2 * weight} ${P5.mouseY + weight / 2} `);
                    break;

            }
        }
    }
}

const P5 = new p5(s, "canvas");