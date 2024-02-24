import { useState } from 'react';
import QRCode from 'react-qr-code';

function parseGistUrl(rawUrl) {
    if (!rawUrl) {
        return {
            error: '',
        };
    }

    let parsedUrl = null;
    try {
        parsedUrl = new URL(rawUrl);
    } catch (e) {
        if (e instanceof TypeError) {
            return { error: "This doesn't look like a URL." };
        } else {
            return { error: 'Unknown error parsing URL.' };
        }
    }

    return {
        ok: `https://www.kerrickstaley.com/transit-panel/?config=https://gist.githubusercontent.com${parsedUrl.pathname}/raw`
    }
}
function ConfigSetup() {
    const [url, setUrl] = useState('');

    let parseResult = parseGistUrl(url);

    let inner = null;
    if (parseResult.hasOwnProperty('error')) {
        inner = <div>{parseResult.error}</div>;
    } else if (parseResult.hasOwnProperty('warning')) {
        inner = <>
            <div>{parseResult.warning}</div>
            <br />
            <QRCode value={parseResult.ok} />
        </>;
    } else {
        inner = <>
            You can open the app with your config at
            <br />
            <a href={parseResult.ok}>{parseResult.ok}</a>
            <br />
            <br />
            Or, scan the below QR code to open the app on a tablet or phone.
            <br />
            <br />
            &nbsp; &nbsp; <QRCode value={parseResult.ok} />
        </>
    }

    return <>
        <h1>Transit Panel</h1>
        <div>
            You need to create a config. Follow these steps:
            <ol>
                <li>Create an account on <a href="https://www.github.com/">GitHub</a> if you don't have one.</li>
                <li>Go to <a href="https://gist.github.com/">GitHub Gist</a>.</li>
                <li>Fill out your config. You can start by just copying and pasting <a href="https://gist.github.com/kerrickstaley/515920f7d552bc8027dc57eed4ec76b8">my config</a>. Click "Create Secret Gist" when done.</li>
                <li>Paste the URL to your config below.</li>
            </ol>
        </div>
        Gist config URL: <input value={url} onChange={e => setUrl(e.target.value)} />
        <br />
        <br />
        {inner}
    </>;
}

export default ConfigSetup;
