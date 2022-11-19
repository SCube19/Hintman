'use strict';

import './popup.css';
import p5 from "p5";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getStorage, storage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { initializeApp } from "firebase/app";
import { QRCodeSVG } from '@cheprasov/qrcode';
import { createPicker } from 'picmo';
let website_url = undefined;
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
const fbstorage = getStorage();
// To get storage access, we have to mention it in `permissions` property of manifest.json file
// More information on Permissions can we found at
// https://developer.chrome.com/extensions/declare_permissions
(() => {
    function setup() {
        document.getElementById('logout').addEventListener('click', logout)
        document.getElementById('goToRegister').addEventListener('click', goToRegister)
        document.getElementById('goToLogin').addEventListener('click', goToLogin)
        document.getElementById('save').addEventListener('click', canvasToBlob)
    }

    function setupFirebase() {
        if (localStorage.getItem("email") !== null) {
            document.getElementById("login").style.display = "none";
            document.getElementById("loggedIn").style.display = "block";

            const mail = localStorage.getItem("email");
            const ident = mail + "/" + website_url;
            console.log("hello " + ident);
            const storageRef = ref(fbstorage, ident);

            getDownloadURL(storageRef)
                .then(url => {
                    document.getElementById("website_url").style.display = "block";
                    document.getElementById("qrcode").style.display = "block";
                })
                .catch(error => {
                    console.log("dupa")
                    document.getElementById("website_url").style.display = "none";
                    document.getElementById("qrcode").style.display = "none";
                });
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
                    setupFirebase();
                }
            );
        });
    }


    document.addEventListener('DOMContentLoaded', startFunction);
    document.addEventListener('DOMContentLoaded', setupFirebase);
})();




///////////////////////// CANVAS.JS ////////////////////////////////
const size = 350;
const textSize = 50;
const backgroundColor = 255;

let strokeColor = '#000000';
let tool = 'pencil';
let weight = 1;
let mode = "draw";
let canvas;

let s = (P5) => {
    P5.setup = () => {
        canvas = P5.createCanvas(size, size);
        canvas.style('pointer-events', 'none');
        P5.textSize(textSize);
    }

    P5.draw = () => {
        if (mode == "emoji") {
            if (P5.mouseIsPressed)
                P5.text(chosenEmoji, P5.mouseX - textSize / 2, P5.mouseY + textSize / 2);
            return;
        }

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
                    break;

            }
        }
    }
}

const P5 = new p5(s, "canvas");

let buttons = document.querySelectorAll('button');
const emojiContainer = document.getElementById("emoji-container");

buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        switch (e.currentTarget.id) {
            case "pencil":
            case "circle":
            case "rect":
            case "triangle":
                console.log(document.getElementById(tool));
                document.getElementById(tool).classList.remove('active-btn');
                tool = e.currentTarget.id;
                e.currentTarget.classList.add('active-btn');
                break;
            case "draw":
            case "eraser":
                document.getElementById(mode).classList.remove('active-btn');
                mode = e.currentTarget.id;
                emojiContainer.style.display = "none";
                e.currentTarget.classList.add('active-btn');
                break;
            case 'emoji':
                document.getElementById(mode).classList.remove('active-btn');
                mode = e.currentTarget.id;
                emojiContainer.style.display = "block";
                e.currentTarget.classList.add('active-btn');
                break;
            case 'clear':
                canvas.clear();

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

const rootElement = document.getElementById("emoji-palette");
const picker = createPicker({ rootElement });

let chosenEmoji = "";

picker.addEventListener('emoji:select', event => {
    chosenEmoji = event.emoji;
});

// ----------------------------- FIREBASE ------------------------------------
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

function canvasToBlob() {
    document.getElementById("defaultCanvas0").toBlob((blob) => {
        var image = new Image();
        image.src = blob;
        const mail = localStorage.getItem("email");

        const ident = mail + "/" + website_url;
        const storageRef = ref(fbstorage, ident);
        console.log(ident)
        uploadBytes(storageRef, blob).then((snapshot) => {
            console.log('Uploaded a blob or file!');
        });
    })
    window.close();
}