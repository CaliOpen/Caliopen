const isObject = (obj) => obj === Object(obj);

/* following code is a refactor of :
 * https://github.com/axios/axios/blob/master/lib/helpers/buildURL.js

Copyright (c) 2014-present Matt Zabriskie

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

 *
 */

const encode = (val) =>
  encodeURIComponent(val)
    .replace(/%40/gi, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, '+')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']');

export const queryStringify = (params) => {
  const parts = [];

  Object.keys(params).forEach((key) => {
    if (params[key] === null || typeof params[key] === 'undefined') {
      return;
    }

    let k = key;
    let v = params[key];

    if (Array.isArray(v)) {
      k += '[]';
    } else {
      v = [v];
    }

    v.forEach((subV) => {
      let finalv = subV;
      if (subV.toISOString) {
        finalv = subV.toISOString();
      } else if (isObject(subV)) {
        finalv = JSON.stringify(subV);
      }
      parts.push(`${encode(k)}=${encode(finalv)}`);
    });
  });

  return parts.join('&');
};
