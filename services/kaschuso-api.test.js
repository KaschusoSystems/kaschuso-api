const { getCookiesFromHeaders } = require('./kaschuso-api');

test('extract cookies from header', () => {
    expect(getCookiesFromHeaders({
        'set-cookie' : [
            'SCDID_S=yacJ16u6KXqt9Q-JCFgJBfCvEVooQ9jGnHqvZhOqhlHPXPqwIUza9A$$#dMp5ltMsuiHcN8lzd5oJhjUNIYLu_aDomqWWvoKShT0$; path=/; Secure; HttpOnly',
            'SLSLanguage=de; Max-Age=94608000; Path=/; Secure; HttpOnly',
            'PHPSESSID=6abvi005sklkauitprbspsoceu; path=/'
        ]
    })).toMatchObject({
        'SCDID_S': 'yacJ16u6KXqt9Q-JCFgJBfCvEVooQ9jGnHqvZhOqhlHPXPqwIUza9A$$#dMp5ltMsuiHcN8lzd5oJhjUNIYLu_aDomqWWvoKShT0$',
        'SLSLanguage': 'de',
        'PHPSESSID': '6abvi005sklkauitprbspsoceu'
    });
});
