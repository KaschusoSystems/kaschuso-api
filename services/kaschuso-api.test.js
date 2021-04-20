const fs = require('fs');

const { 
    getCookiesFromHeaders,
    toCookieHeaderString,
    findUrlByPageid,
    getMandatorsFromHtml,
    getAbsencesFromHtml,
    getGradesFromHtml,
    getUserInfoFromHtml,
    getCurrentRequestedPageFromHtml,
    getActionFromSesJs
} = require('./kaschuso-api');

test('extract cookies from header', () => {
    expect(getCookiesFromHeaders({
        'set-cookie' : [
            'SCDID_S=yacJ16u6KXqt9Q-JCFgJBfCvEVooQ9jGnHqvZhOqhlHPXPqwIUza9A$$#dMp5ltMsuiHcN8lzd5oJhjUNIYLu_aDomqWWvoKShT0$; path=/; Secure; HttpOnly',
            'SLSLanguage=de; Max-Age=94608000; Path=/; Secure; HttpOnly',
            'PHPSESSID=6abvi005sklkauitprbspsoceu; path=/'
        ]
    })).toEqual({
        'SCDID_S': 'yacJ16u6KXqt9Q-JCFgJBfCvEVooQ9jGnHqvZhOqhlHPXPqwIUza9A$$#dMp5ltMsuiHcN8lzd5oJhjUNIYLu_aDomqWWvoKShT0$',
        'SLSLanguage': 'de',
        'PHPSESSID': '6abvi005sklkauitprbspsoceu'
    });
});

test('put cookies in header string', () => {
    expect(toCookieHeaderString({
        'SCDID_S': 'yacJ16u6KXqt9Q-JCFgJBfCvEVooQ9jGnHqvZhOqhlHPXPqwIUza9A$$#dMp5ltMsuiHcN8lzd5oJhjUNIYLu_aDomqWWvoKShT0$',
        'SLSLanguage': 'de',
        'PHPSESSID': '6abvi005sklkauitprbspsoceu'
    })).toBe('SCDID_S=yacJ16u6KXqt9Q-JCFgJBfCvEVooQ9jGnHqvZhOqhlHPXPqwIUza9A$$#dMp5ltMsuiHcN8lzd5oJhjUNIYLu_aDomqWWvoKShT0$; SLSLanguage=de; PHPSESSID=6abvi005sklkauitprbspsoceu');
});

test('find url by pageid', async () => {
    const html = fs.readFileSync('./__test__/start.html', 'utf8');
    expect(findUrlByPageid('school', html, 22500))
    .toBe('https://kaschuso.so.ch/school/index.php?pageid=22500&id=f0c039a84fc469e6&amp;transid=5a5e77');
});

test('find url by pageid', async () => {
    const html = fs.readFileSync('./__test__/root.html', 'utf8');
    expect(getMandatorsFromHtml(html))
    .toEqual([
        {
            "name": "bzwh",
            "description": "Bildungszentrum Wallierhof",
            "url": "https://kaschuso.so.ch/bzwh"
        },
        {
            "name": "ebzso",
            "description": "Erwachsenenbildungszentrum Solothurn",
            "url": "https://kaschuso.so.ch/ebzso"
        },
        {
            "name": "gibsso",
            "description": "Gewerblich-industrielle Berufsfachschule Solothurn",
            "url": "https://kaschuso.so.ch/gibsso"
        }
    ]);
});

test('get absences from html', async () => {
    const html = fs.readFileSync('./__test__/absences.html', 'utf8');
    expect(getAbsencesFromHtml(html))
    .toEqual([
        {
            "date": "30.03.2021",
            "time": "13:50 - 14:35",
            "class": "M326-INF17A,INF17B-MOSD",
            "status": "Entschuldigt",
            "comment": "Krank Erkältung",
            "reason": "Interview mit der FHNW",
        },
        {
            "date": "30.03.2021",
            "time": "14:40 - 15:25",
            "class": "M326-INF17A,INF17B-MOSD",
            "status": "Unentschuldigt",
            "reason": "Krank",
        },
        {
            "date": "11.03.2020",
            "time": "13:50 - 14:35",
            "class": "M151-INF17A-MOSD",
            "status": "Nicht zählend",
        },
        {
            "date": "15.03.2019",
            "time": "08:25 - 09:10",
            "class": "M151-INF17A-MOSD",
            "status": "offen",
            "comment": "Zahnarztbesuch",
            "reason": "Rektruktierung",
        },
    ]);
});

test('get grades from html', async () => {
    const html = fs.readFileSync('./__test__/grades.html', 'utf8');
    expect(getGradesFromHtml(html))
    .toEqual([
        {
            "class": "D-BM1_TE17A-GEIM",
            "name": "Deutsch",
            "average": "4.875",
            "grades": [
                {
                    "date": "22.03.2021",
                    "title": "Schachnovelle",
                    "value": "5.25",
                    "points": "12",
                    "weighting": "1"
                },
                {
                    "date": "08.04.2021",
                    "title": "Literaturgeschichte",
                    "value": "4.5",
                    "points": "18",
                    "weighting": "1"
                }
            ]
        },
        {
            "class": "M326-INF17A,INF17B-MOSD",
            "name": "M326 Objektorientiert entwerfen und implementieren",
            "average": "6.000",
            "grades": [
                {
                    "date": "30.03.2021",
                    "title": "Anwendung Projekt M306",
                    "value": "6",
                    "points": "21",
                    "weighting": "1"
                }
            ]
        },
        {
            "class": "MS-BM1_TE17A-HARS",
            "name": "Mathematik Schwerpunkt",
            "average": "4.700",
            "grades": [
                {
                    "date": "18.03.2021",
                    "title": "Skalarprodukt",
                    "value": "4.7",
                    "points": "8",
                    "weighting": "1"
                }
            ]
        },
        {
            "class": "PH-BM1_TE17A-HARS",
            "name": "Physik",
            "average": "5.763",
            "grades": [
                {
                    "date": "29.01.2021",
                    "title": "Noise-Cancelling",
                    "value": "5.625",
                    "weighting": "1"
                },
                {
                    "date": "26.03.2021",
                    "title": "Schwingungen",
                    "value": "5.9",
                    "points": "17",
                    "weighting": "1"
                }
            ]
        }
    ]);
});

test('get user info from html', async () => {
    const homeHtml = fs.readFileSync('./__test__/start.html', 'utf8');
    const settingsHtml = fs.readFileSync('./__test__/settings.html', 'utf8');
    expect(getUserInfoFromHtml(homeHtml, settingsHtml, "school", "vorname.nachname"))
    .toEqual({
        "mandator": "school",
        "username": "vorname.nachname",
        "name": "Nachname Vorname",
        "address": "Hauptstrasse 1",
        "zipCity": "9000 St. Gallen",
        "birthdate": "11.09.2001",
        "education": "Gringverdiener EFZ - Systemer / VWB abbroche",
        "hometown": "St. Gallen",
        "phone": "+41 32 627 78 00",
        "mobile": "+41 79 420 69 69",
        "email": "vorname.nachname@bbzsogr.ch",
        "privateEmail": "vorname.nachname@gmail.com"
    });
});

test('get current requested page from html', async () => {
    const html = fs.readFileSync('./__test__/login.html', 'utf8');
    expect(getCurrentRequestedPageFromHtml(html))
    .toBe('LcLjlOlhylNbKRBT%2BWI6BQ%3D%3D');
});

test('get action from ses.js', async () => {
    const html = fs.readFileSync('./__test__/ses.js', 'utf8');
    expect(getActionFromSesJs(html))
    .toMatch(/^auth\?8C3C82CB56AE=[\da-f]{32}$/);
});
