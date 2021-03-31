require('dotenv').config();

const axios = require('axios').default;
// sslkeylog = require('sslkeylog');
// sslkeylog.hookAll();
axios.defaults.withCredentials = true;
const FormData = require('form-data');

const cheerio = require('cheerio');
// const xpath = require('xpath-html');
// const dom = require('xmldom').DOMParser

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


const INIT_URL = 'https://kaschuso.so.ch/gibsso';
const AUTH_URL = 'https://kaschuso.so.ch/login/sls/auth?86D0CA1D738C=c73bced75cce9f98ad1b26cbea356680';
const FORM_URL = 'https://kaschuso.so.ch/login/sls/auth?RequestedPage=%2fgibsso';


const cookies = [];
let SCDID_S;


async function main() {
    let headers = Object.assign({}, DEFAULT_HEADERS);

    const res = await axios.get(INIT_URL, {
        withCredentials: true,
        headers: headers,
        maxRedirects: 0,
    });

    SCDID_S = getScdidsCookie(res.cookieValue);
    console.log('Got session id: ' + SCDID_S);
    if (res.cookieValue) {
        headers['Cookie'] = SCDID_S;
    }

    if (res.locationValue) {
        console.log('Redirecting request: ' + res.locationValue);
        const redirectRes = await axios.get(res.locationValue, {
            withCredentials: true,
            headers: headers,
            maxRedirects: 0,
        });
    }

    console.log('Requesting: ' + FORM_URL);
    const formRes = await axios.get(FORM_URL, {
        withCredentials: true,
        headers: headers,
        maxRedirects: 0,
    });

    const currentRequestedPage = getInputValue(formRes.data, 'input[name=currentRequestedPage]');
    const formData = createFormData(`${process.env.FIRST_NAME}.${process.env.LAST_NAME}`, process.env.PASSWORD, currentRequestedPage);
    console.log(formData);
}


// uuuuugggllllyyyyyy haaaaaackckckckckck
function getScdidsCookie(cookies) {
    if (cookies && cookies.length >= 1) {
        return cookies[0].split(';')[0];
    }
    return null;
}

function createFormData(username, password, requestedPage) {
    const formData = new FormData();
    formData.append('userid', username);
    formData.append('password', password);
    formData.append('currentRequestedPage', requestedPage);
    return formData;
}




function getInputValue(html, selector) {
    const $ = cheerio.load(html);
    return $(selector).attr('value');
}

main();

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