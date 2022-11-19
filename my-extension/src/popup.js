'use strict';

import './popup.css';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword  } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { QRCodeSVG } from '@cheprasov/qrcode';

(function () {
  // We will make use of Storage API to get and store `count` value
  // More information on Storage API can we found at
  // https://developer.chrome.com/extensions/storage

  // To get storage access, we have to mention it in `permissions` property of manifest.json file
  // More information on Permissions can we found at
  // https://developer.chrome.com/extensions/declare_permissions

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
        tab.id,
        { type: 'URL' },
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