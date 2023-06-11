import {useState} from 'react';

export default function FullscreenButton() {
    let [visible, setVisible] = useState(true);
    let [wakeLockErrorVisible, setWakeLockErrorVisible] = useState(false);

    function goFullscreen() {
        document.querySelector('body').requestFullscreen().catch(err => {
            alert('Unable to fullscreen: ' + err.message);
        });

        if (navigator.wakeLock == undefined) {
            setWakeLockErrorVisible(true);
        } else {
            navigator.wakeLock.request("screen");
        }
        setVisible(false);
    }

    return <>
        <button onClick={goFullscreen} style={{display: visible ? '' : 'none'}}>
            Click to go fullscreen and prevent screen from sleeping
        </button>
        <div style={{display: wakeLockErrorVisible ? '' : 'none', backgroundColor: '#eeeeee' }}>
            Unable to prevent screen from sleeping. Try a different browser that supports the Wake
            Lock API, or check that the page is served over HTTPS.
        </div>
    </>;
}
