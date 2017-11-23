// source: https://github.com/GreenGremlin/scroll-doc

// The MIT License (MIT)
//
// Copyright (c) 2016 Jonathan
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

let scrollElem;

const detectScrollElem = () => {
  const win = window || {};
  const doc = document || {};

  // IE < 9 & Node
  if (win.pageYOffset === undefined && doc.documentElement) {
    return doc.documentElement;
  }

  const startScrollTop = win.pageYOffset;
  doc.documentElement.scrollTop = startScrollTop + 1;
  if (win.pageYOffset > startScrollTop) {
    doc.documentElement.scrollTop = startScrollTop;
    // IE > 9 & FF (standard)

    return doc.documentElement;
  }
  // Chrome (non-standard)

  return doc.scrollingElement || doc.body;
};

export default () => scrollElem || (scrollElem = detectScrollElem());
