const cryptoRandomString = require('crypto-random-string');

const axios = require('axios').default;
axios.defaults.withCredentials = true;

const qs = require('qs');
const cheerio = require('cheerio');

const BASE_URL   = 'https://kaschuso.so.ch/';
const FORM_URL   = BASE_URL + 'login/sls/auth?RequestedPage=%2f';
const LOGIN_URL  = BASE_URL + 'login/sls/';
const SES_JS_URL = BASE_URL + 'sil-bid-check/ses.js';


const MARKS_PAGE_ID    = 21311;
const ABSENCES_PAGE_ID = 21111;
const SETTINGS_PAGE_ID = 22500;

const SES_PARAM_REGEX = "var bid = getBid\\\('([^']*?)'";

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

var cookiesMap = [];

async function authenticate(mandator, username, password) {
    console.log('Authenticating: ' + username);

    let headers = Object.assign({}, DEFAULT_HEADERS);

    // set basic cookies to request login page

    const initRes = await axios.get(BASE_URL + mandator, {
        withCredentials: true,
        headers: headers,
        maxRedirects: 0
    });

    var cookies = {
        SCDID_S: initRes.cookieValue[0].split(';')[0].split('=')[1],
        SLSLanguage: 'de'
    };
    headers['Cookie'] = toCookieHeaderString(cookies);

    await axios.get(initRes.locationValue, {
        withCredentials: true,
        headers: headers,
        maxRedirects: 0
    });

    // request login page

    const formRes = await axios.get(FORM_URL + mandator, {
        withCredentials: true,
        headers: headers,
        maxRedirects: 0
    });

    const sesJS = await axios.get(SES_JS_URL, {
        withCredentials: true,
        headers: headers,
        maxRedirects: 0
    });
    
    let param = sesJS.data.match(SES_PARAM_REGEX)[1];
    let action = 'auth?' + param + '=' + cryptoRandomString({length: 32, type: 'hex'});

    const currentRequestedPage = cheerio.load(formRes.data)('input[name=currentRequestedPage]').attr('value');
    
    let loginHeaders = Object.assign({}, headers);
    loginHeaders['Content-Type'] = 'application/x-www-form-urlencoded';

    // make login

    const loginRes = await axios.post(LOGIN_URL + action, 
        qs.stringify({
            userid: username,
            password: password,
            currentRequestedPage: currentRequestedPage
        }),
        {
            withCredentials: true,
            headers: loginHeaders,
            maxRedirects: 0
        }
    );

    if (!loginRes.cookieValue) {
        const error =  new Error('username or password invalid');
        error.name = 'AuthenticationError';
        throw error;
    }
    
    cookies['SCDID_S'] = loginRes.cookieValue[0].split(';')[0].split('=')[1];

    storeCookies(mandator, username, cookies);

    return cookies;
}


async function getUserInfo(mandator, username, password) {
    console.log('Getting user info for: ' + username);

    let cookies = await getCookies(mandator, username, password);
    
    let headers = Object.assign({}, DEFAULT_HEADERS);
    headers['Cookie'] = toCookieHeaderString(cookies);
    
    const homeRes = await axios.get(BASE_URL + mandator + '/loginto.php', {
        withCredentials: true,
        headers: headers,
        maxRedirects: 0
    });
    
    const $home = cheerio.load(homeRes.data);
    const infos = {}
    $home('#content-card > div > div > table')
        .find('tbody > tr')
        .toArray()
        .forEach(x => {
            const row = $home(x)
                .find('td')
                .toArray()
                .map(x => $home(x).text())
            infos[row[0]] = row[1];
        });

    cookies['PHPSESSID']  = homeRes.headers['set-cookie'][0].split(';')[0].split('=')[1];
    cookies['layoutSize'] = homeRes.headers['set-cookie'][1].split(';')[0].split('=')[1]
    headers['Cookie'] = toCookieHeaderString(cookies);

    const settingsUrl = findUrl(mandator, homeRes.data, SETTINGS_PAGE_ID);

    const settingsRes = await axios.get(settingsUrl, {
        withCredentials: true,
        headers: headers,
        maxRedirects: 0
    });
   
    const $settings = cheerio.load(settingsRes.data);
   
    const email = $settings('#f0').attr('value');
    const privateEmail = $settings('#f1').attr('value');
    
    return {
        mandator: mandator,
        username: username,
        name: infos['Name'],
        address: infos['Adresse'],
        zipCity: infos['Ort'],
        birthdate: infos['Geburtsdatum'],
        education: infos['Ausbildungsgang'],
        hometown: infos['Heimatort'],
        phone: infos['Telefon'],
        mobile: infos['Mobiltelefon'],
        email: email,
        privateEmail: privateEmail,
    }
}

async function getMarks(mandator, username, password) {
    console.log('Getting marks for: ' + username);
    let cookies = await getCookies(mandator, username, password);
    
    let headers = Object.assign({}, DEFAULT_HEADERS);
    headers['Cookie'] = toCookieHeaderString(cookies);
    
    const homeRes = await axios.get(BASE_URL + mandator + '/loginto.php', {
        withCredentials: true,
        headers: headers,
        maxRedirects: 0
    });
    
    cookies['PHPSESSID']  = homeRes.headers['set-cookie'][0].split(';')[0].split('=')[1];
    cookies['layoutSize'] = homeRes.headers['set-cookie'][1].split(';')[0].split('=')[1]
    headers['Cookie'] = toCookieHeaderString(cookies);

    const marksUrl = findUrl(mandator, homeRes.data, MARKS_PAGE_ID);

    const marksRes = await axios.get(marksUrl, {
        withCredentials: true,
        headers: headers,
        maxRedirects: 0
    });

    const $ = cheerio.load(marksRes.data);

    return $('#uebersicht_bloecke>page>div>table')
        // find table with marks for each subject
        .find('tbody>tr>td>table')
        .toArray()
        .map(x => {
            // find the previous table row with subject details
            const subjectsRowCells = $(x).parents().prev()
                .find('td')
                .toArray()
                .map(x => $(x).html());

            const clazz = subjectsRowCells[0].match('<b>([^<]*)<\\/b>')[1];
            const name = subjectsRowCells[0].match('<br>([^<]*)')[1];
            const average = subjectsRowCells[1].trim();
            
            // find all marks for a subject 
            const marks = $(x).find('tbody>tr')
                .toArray()
                // filter header row and totalizer row
                .filter(x => !$(x).find('td>i')[0])
                .map(x => {
                    const markRowCells = $(x)
                        .find('td')
                        .toArray()
                        .map(x => $(x).text().trim());
                        
                    const valuePoints = markRowCells[2].split('\n');
                    const value = valuePoints[0] ? valuePoints[0] : undefined;
                    const points = valuePoints[1] ? valuePoints[1].match('Punkte: (\\d*)')[1] : undefined;
                    return {
                        date: markRowCells[0],
                        title: markRowCells[1],
                        value: value,
                        points: points,
                        weighting: markRowCells[3]
                    };
                });
            return {
                class: clazz,
                name: name,
                average: average,
                marks: marks
            };
        });
} 

async function getAbsences(mandator, username, password) {
    console.log('Getting absences for: ' + username);
    let cookies = await getCookies(mandator, username, password);
    
    let headers = Object.assign({}, DEFAULT_HEADERS);
    headers['Cookie'] = toCookieHeaderString(cookies);
    
    const homeRes = await axios.get(BASE_URL + mandator + '/loginto.php', {
        withCredentials: true,
        headers: headers,
        maxRedirects: 0
    });
    
    cookies['PHPSESSID']  = homeRes.headers['set-cookie'][0].split(';')[0].split('=')[1];
    cookies['layoutSize'] = homeRes.headers['set-cookie'][1].split(';')[0].split('=')[1]
    headers['Cookie'] = toCookieHeaderString(cookies);

    const absencesUrl = findUrl(mandator, homeRes.data, ABSENCES_PAGE_ID);

    const absencesRes = await axios.get(absencesUrl, {
        withCredentials: true,
        headers: headers,
        maxRedirects: 0
    });

    const $ = cheerio.load(absencesRes.data);
    
    return $('#uebersicht_bloecke>page>div>form>table')
        // find table with marks for each subject
        .find('tbody>tr')
        .toArray()
        // filter totalizer row
        .filter(x => $(x).find('td > div > input')[0])
        .map(x => {
            const absenceRowCells = $(x)
                .find('td')
                .toArray()
                .map(x => $(x).text().trim());

            const reason = $(x).find('td > div > input').attr('value');
            
            return {
                date: absenceRowCells[0],
                time: absenceRowCells[1],
                class: absenceRowCells[2],
                status: absenceRowCells[3],
                comment: absenceRowCells[4] ? absenceRowCells[4] : undefined,
                reason: reason ? reason : undefined
            };
        });
}

function findUrl(mandator, html, pageid) {
    return BASE_URL + mandator + '/' + html.match('"(index\\.php\\?pageid=' + pageid + '[^"]*)"')[1];
}

async function getCookies(mandator, username, password) {
    const key = mandator + ":" + username;
    let cookies = cookiesMap[key];
    if (!cookies) {
        cookies = await authenticate(mandator, username, password);
        cookiesMap[key] = cookies;
    } else {
        // check if cookies are valid
        let headers = Object.assign({}, DEFAULT_HEADERS);
        headers['Cookie'] = toCookieHeaderString(cookies);
        
        const homeRes = await axios.get(BASE_URL + mandator + '/loginto.php', {
            withCredentials: true,
            headers: headers,
            maxRedirects: 0
        });
        if (homeRes.status !== 200) {
            console.log('Session expired for: ' + username);
            cookies = await authenticate(mandator, username, password);
            cookiesMap[key] = cookies;
        }
    }

    return cookies;
}

function storeCookies(mandator, username, cookies) {
    cookiesMap[mandator + ":" + username] = cookies;
}

function toCookieHeaderString(cookies) {
    let headerString = "";

    for(var k in cookies) {
        if (headerString) {
            headerString += "; ";
        } 
        headerString += k + "=" + cookies[k]
    }
    return headerString;
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

module.exports = {
    authenticate,
    getUserInfo,
    getMarks,
    getAbsences
};