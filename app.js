require('dotenv').config();
const cryptoRandomString = require('crypto-random-string');

const axios = require('axios').default;
// sslkeylog = require('sslkeylog');
// sslkeylog.hookAll();

axios.defaults.withCredentials = true;

var qs = require('qs');

const cheerio = require('cheerio');

const DEFAULT_HEADERS = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,/;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9,de-CH;q=0.8,de;q=0.7',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'DNT': '1',
    'Host': 'kaschuso.so.ch',
    'Pragma': 'no-cache',
    'sec-ch-ua': '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36'
};

const BASE_URL = 'https://kaschuso.so.ch/';
const FORM_URL = 'https://kaschuso.so.ch/login/sls/auth?RequestedPage=%2f';
const LOGIN_URL = 'https://kaschuso.so.ch/login/sls/';
const SES_JS_URL = 'https://kaschuso.so.ch/sil-bid-check/ses.js';

const SES_PARAM_REGEX = "var bid = getBid\\\('([^']*?)'";

async function main() {
    var session = await authenticate(process.env.MANDATOR, process.env.KASCHUSO_USERNAME, process.env.PASSWORD);

    console.log(session);
}

async function authenticate(mandator, username, password) {
    
    let headers = Object.assign({}, DEFAULT_HEADERS);

    // set basic cookies to request login page

    const initRes = await axios.get(BASE_URL + mandator, {
        withCredentials: true,
        headers: headers,
        maxRedirects: 0,
    });

    SCDID_S = initRes.cookieValue[0].split(';')[0];
    console.log('Got session id: ' + SCDID_S);
    headers['Cookie'] = SCDID_S + '; SLSLanguage=de';

    console.log('Redirecting to: ' + initRes.locationValue);
    await axios.get(initRes.locationValue, {
        withCredentials: true,
        headers: headers,
        maxRedirects: 0,
    });

    // request login page

    const formUrl = FORM_URL + mandator;

    console.log('Requesting: ' + formUrl);
    const formRes = await axios.get(formUrl, {
        withCredentials: true,
        headers: headers,
        maxRedirects: 0,
    });

    console.log('Requesting: ' + SES_JS_URL);
    const sesJS = await axios.get(SES_JS_URL, {
        withCredentials: true,
        headers: headers,
        maxRedirects: 0,
    });
    
    let param = sesJS.data.match(SES_PARAM_REGEX)[1];
    let action = 'auth?' + param + '=' + cryptoRandomString({length: 32, type: 'hex'});

    const currentRequestedPage = cheerio.load(formRes.data)('input[name=currentRequestedPage]').attr('value');
    
    let loginHeaders = Object.assign({}, headers);
    loginHeaders['Content-Type'] = 'application/x-www-form-urlencoded';

    // make login

    const loggedIn = await axios.post(LOGIN_URL + action, 
        qs.stringify({
            userid: username,
            password: password,
            currentRequestedPage: currentRequestedPage,
        }),
        {
            withCredentials: true,
            headers: loginHeaders,
            maxRedirects: 0,
        }
    );
    
    var SCDID_S = loggedIn.cookieValue[0].split(';')[0];
    console.log('Got session id: ' + SCDID_S);

    return SCDID_S;
}

axios.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response.status === 302) {
        const cookieValue = error.response.headers['set-cookie'];
        const locationValue = error.response.headers.location;
        return Promise.resolve({error, cookieValue, locationValue});
    }
    return Promise.reject(error);
});

main();
