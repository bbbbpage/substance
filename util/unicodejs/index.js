/*
  Borrowed from https://git.wikimedia.org/git/unicodejs.git.

  Copyright (c) 2013–2015 UnicodeJS team and others under the terms
  of The MIT License (MIT), as follows:

  This software consists of voluntary contributions made by many
  individuals (AUTHORS.txt) For exact contribution history, see the
  revision history and logs, available at https://gerrit.wikimedia.org

  Permission is hereby granted, free of charge, to any person obtaining
  a copy of this software and associated documentation files (the
  "Software"), to deal in the Software without restriction, including
  without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so, subject to
  the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
  LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
  WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var unicodeJS = {};

var common = require('./unicodejs_common');
for(var exp in common) {
	unicodeJS[exp] = common[exp];
}

unicodeJS.graphemebreakproperties = require('./graphemebreakproperties');
unicodeJS.graphemebreak = require('./graphemebreak');

unicodeJS.wordbreakproperties = require('./wordbreakproperties');
unicodeJS.wordbreak = require('./wordbreak');

unicodeJS.UnicodeString = require('./UnicodeString');

module.exports = unicodeJS;
