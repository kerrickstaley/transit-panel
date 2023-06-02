import {useState} from 'react';

export default function FullscreenButton() {
    let [visible, setVisible] = useState(true);

    function goFullscreen() {
        document.querySelector('body').requestFullscreen().catch(err => {
            alert('Unable to fullscreen: ' + err.message);
        });
        setVisible(false);
    }

    return <button onClick={goFullscreen} style={{display: visible ? '' : 'none'}}>
        Click to go fullscreen
    </button>;
}
