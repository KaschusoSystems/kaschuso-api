const axios = require('axios').default;
axios.defaults.withCredentials = true;

const xpath = require('xpath-html');
// const dom = require('xmldom').DOMParser

const headers = {
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


async function main() {
    const res = await axios.get('https://kaschuso.so.ch/login/sls/auth?RequestedPage=%2fgibsso', {
        withCredentials: true,
        headers: headers
    });

    console.log(res.headers);
    console.log(selectFromHtml('//*[@id="form-holder"]/div/form', res.data).getAttribute('action'));
}

function selectFromHtml(selector, html) {
    /*
    const domObject = new dom({
        locator: {},
        errorHandler: { warning: function (w) { }, 
        error: function (e) { }, 
        fatalError: function (e) { console.error(e) } }
    }).parseFromString(templateHtml);
    const action = xpath.select('//*[@id="form-holder"]/div/form/@action', domObject).toString();
    */
    return xpath.fromPageSource(html).findElement(selector);
}

main();