'use strict';

import './popup.css';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword  } from "firebase/auth";
import { initializeApp, registerVersion } from "firebase/app";




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
        document.getElementById('incrementBtn').addEventListener('click', initFirebase);

        document.getElementById('decrementBtn').addEventListener('click', () => {
            updateCounter({
                type: 'DECREMENT',
            });
        });
        document.getElementById('logout').addEventListener('click', logout)
        document.getElementById('goToRegister').addEventListener('click', goToRegister)
        document.getElementById('goToLogin').addEventListener('click', goToLogin)

        if (localStorage.getItem("email") !== null) {
            document.getElementById("login").style.display = "none";
            document.getElementById("loggedIn").style.display = "block";
        }
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

    function formFunction() {
        document.getElementById("login_form").addEventListener('submit', e => {
            e.preventDefault();
            const data = new FormData(e.target);
            // console.log([...data.entries()]);
            tryLogin([...data.entries()])
          });
    }

    document.addEventListener('DOMContentLoaded', formFunction);
    
    function formFunctionRegister() {
        document.getElementById("register_form").addEventListener('submit', e => {
            e.preventDefault();
            const data = new FormData(e.target);
            // console.log([...data.entries()]);
            tryRegister([...data.entries()])
          });
    }

    document.addEventListener('DOMContentLoaded', formFunctionRegister);

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
    

    // Communicate with background file by sending a message
    chrome.runtime.sendMessage({
            type: 'GREETINGS',
            payload: {
                message: 'Hello, my name is Pop. I am from Popup.',
            },
        },
        (response) => {
            console.log(response);
        }
    );

})();

import { QRCodeRaw, QRCodeSVG, QRCodeCanvas, QRCodeText } from '@cheprasov/qrcode';

const divElement = document.getElementById('qrcode');

const qrSVG = new QRCodeSVG('https://github.com/cheprasov/js-qrcode/', {
    level: 'Q',
    image: {
        source: 'GitHub-Mark-120px-plus.png',
        width: '20%',
        height: '20%',
        x: 'center',
        y: 'center',
    },
});
console.log(qrSVG.toString());

document.getElementById('qrcode').innerHTML = qrSVG.toString();

(() => {
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { data } = obj;
        console.log(data);
        document.getElementById('qrcode').innerHTML = "xd";
    });
})();








































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

function initFirebase() {
  
    // Initialize Firebase
    console.log("siema")
    const app = initializeApp(firebaseConfig);
    console.log("siema")
  
    const email = "wektor@dupa.com"
    const password = "123pass"

    const auth = getAuth();


    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        console.log(user);
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorMessage);
      });
}

function tryLogin(data) {
    signInWithEmailAndPassword(auth, data[0][1], data[1][1])
      .then((userCredential) => {
        const user = userCredential.user;
        localStorage.setItem('email', user.email);
        document.getElementById("login").style.display = "none";
        document.getElementById("loggedIn").style.display = "block";
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
    createUserWithEmailAndPassword (auth, data[0][1], data[1][1])
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


