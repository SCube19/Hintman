'use strict';

import './popup.css';
import p5 from "p5";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { QRCodeSVG } from '@cheprasov/qrcode';
import { createPicker } from 'picmo';

// To get storage access, we have to mention it in `permissions` property of manifest.json file
// More information on Permissions can we found at
// https://developer.chrome.com/extensions/declare_permissions
(() => {
    function setup() {
        document.getElementById('logout').addEventListener('click', logout)
        document.getElementById('goToRegister').addEventListener('click', goToRegister)
        document.getElementById('goToLogin').addEventListener('click', goToLogin)

        if (localStorage.getItem("email") !== null) {
            document.getElementById("login").style.display = "none";
            document.getElementById("loggedIn").style.display = "block";
        }
    }

    function updateQR(url) {
        const qrSVG = new QRCodeSVG(url, {
            level: 'Q',
            image: {
                source: "https://i.ebayimg.com/images/g/WK8AAOSw4Fdck1Zt/s-l500.jpg",
                width: '20%',
                height: '20%',
                x: 'center',
                y: 'center',
                border: null,
            },
        });

        const divElement = document.getElementById('qrcode');
        divElement.innerHTML = qrSVG.toString();
    }

    document.addEventListener('DOMContentLoaded', setup);
    document.addEventListener('DOMContentLoaded', formFunction);
    document.addEventListener('DOMContentLoaded', formFunctionRegister);

    function formFunction() {
        document.getElementById("login_form").addEventListener('submit', e => {
            e.preventDefault();
            const data = new FormData(e.target);
            // console.log([...data.entries()]);
            tryLogin([...data.entries()])
        });
    }

    function formFunctionRegister() {
        document.getElementById("register_form").addEventListener('submit', e => {
            e.preventDefault();
            const data = new FormData(e.target);
            // console.log([...data.entries()]);
            tryRegister([...data.entries()])
        });
    }

    function logout() {
        localStorage.clear()
        document.getElementById("loggedIn").style.display = "none";
        document.getElementById("login").style.display = "block";
    }

    function goToRegister() {
        document.getElementById("login").style.display = "none";
        document.getElementById("register").style.display = "block";
    }

    function goToLogin() {
        document.getElementById("register").style.display = "none";
        document.getElementById("login").style.display = "block";
    }

    let website_url = undefined;

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
                    website_url = response.url;
                    updateQR(website_url);
                }
            );
        });
    }


    document.addEventListener('DOMContentLoaded', startFunction);

})();




///////////////////////// CANVAS.JS ////////////////////////////////
const size = 350;
const backgroundColor = 255;

let strokeColor = '#000000';
let tool = 'pencil';
let weight = 10;
let mode = "draw";
let canvas;

let s = (P5) => {
    P5.setup = () => {
        canvas = P5.createCanvas(size, size);
        P5.background(backgroundColor);
        canvas.style('pointer-events', 'none');
        canvas.clear();
    }

    P5.draw = () => {
        if (mode == "draw")
            P5.stroke(strokeColor);
        else
            P5.stroke(backgroundColor);

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

let buttons = document.querySelectorAll('button');

buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        switch (e.target.id) {
            case "pencil":
            case "circle":
            case "rect":
            case "triangle":
                tool = e.target.id;
                break;
            case "draw":
            case "eraser":
                mode = e.target.id;
        }
    })
})

document.getElementById('canvas-color').addEventListener('change', (e) => {
    strokeColor = e.target.value;
    console.log(strokeColor);
})

document.getElementById('canvas-weight').addEventListener('change', (e) => {
    weight = e.target.value;
})




///////////////////////////////// EMOJI ///////////////////////////////////////

const emojiField = document.getElementById("emoji-field");
const emojiBackspace = document.getElementById("emoji-backspace");
const rootElement = document.getElementById("emoji-palette");
const picker = createPicker({ rootElement });

let emojiArray = [];
let emojiString = "";

picker.addEventListener('emoji:select', event => {
  if (emojiArray.length == 9)
    return;
  emojiArray.push(event.emoji);
  emojiString = emojiArray.join("");
  canvas_emoji.background(backgroundColor);
});

emojiBackspace.addEventListener("click", () => {
  emojiArray.pop();
  emojiString = emojiArray.join("");
  canvas_emoji.background(backgroundColor);
});


const canvasContainer = document.getElementById("canvas-container");
const emojiContainer = document.getElementById("emoji-container");
const switchButton = document.getElementById("switch");

switchButton.addEventListener("click", () => {
  if (canvasContainer.style.display === "none") {
    canvasContainer.style.display = "block";
    emojiContainer.style.display = "none";
    canvas.background(backgroundColor);
  } else {
    canvasContainer.style.display = "none";
    emojiContainer.style.display = "block";
    emojiArray = [];
    emojiString = "";
    canvas_emoji.background(backgroundColor);
  }
});

let canvas_emoji;

let ss = (P5) => {
  P5.setup = () => {
      canvas_emoji = P5.createCanvas(size, size);
      P5.background(backgroundColor);
      P5.textSize(50);
      canvas_emoji.style('pointer-events', 'none');
      canvas_emoji.clear();
      P5.textAlign(P5.CENTER)
      // P5.text('😜😂😍', size/2, size/2);
      // P5.text('☀️🌬️🛬', size/2, size/2 + 100);
  }

  P5.draw = () => {
    P5.text(emojiString, size/2, size/2);
  }
}

const P52 = new p5(ss, "emoji-field");



// ----------------------------- FIREBASE ------------------------------------
const firebaseConfig = {
    apiKey: "AIzaSyDxO5C3fG4AyhcZn_wKrYgSGJxer0RatF4",
    authDomain: "hintman-f86e1.firebaseapp.com",
    projectId: "hintman-f86e1",
    storageBucket: "hintman-f86e1.appspot.com",
    messagingSenderId: "366527975531",
    appId: "1:366527975531:web:96ec38736b8e185215e12e",
    measurementId: "G-S1JKPR54K8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();

function tryLogin(data) {
    signInWithEmailAndPassword(auth, data[0][1], data[1][1])
        .then((userCredential) => {
            const user = userCredential.user;
            localStorage.setItem('email', user.email);
            document.getElementById("login").style.display = "none";
            document.getElementById("loggedIn").style.display = "block";
            canvas.clear();
        })
        .catch((error) => {
            console.log(error);
            alert("Authentication failed");
        });
}

function tryRegister(data) {
    if (data[1][1] !== data[2][1]) {
        alert("Passwords aren't equal");
        return;
    }
    createUserWithEmailAndPassword(auth, data[0][1], data[1][1])
        .then((userCredential) => {
            const user = userCredential.user;
            localStorage.setItem('email', user.email);
            document.getElementById("register").style.display = "none";
            document.getElementById("loggedIn").style.display = "block";
        })
        .catch((error) => {
            console.log(error);
            alert("Invalid email address");
        });
}