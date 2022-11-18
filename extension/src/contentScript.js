(() => {
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { data } = obj;
        console.log(data);
        document.getElementById('qrcode').innerHTML = "xd";
    });
})();