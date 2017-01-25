#### _Username_ specifications for Caliopen accounts

This document describes valid **username** for the creation of an account within Caliopen instances.

#### Preambule
Caliopen's users should be able to take (almost) any username they want to, as long as this username could make the local-part of an email address.  
The current specification is based on RFC 5322 for the Internet Message Format, but it does not allow "comment" and "quoted-string" lexical tokens. Consequently, some special characters are not allowed (see below).

##### Definition :
An **username** is the unique identifier an user makes use of to create an account within a Caliopen instance. 
Username is an identifier for the user's account : it is not necessarily the user's real name, or email, or nickname… It will be used as a credential for the purpose of identifying the user when logging in Caliopen. The username is unique within a Caliopen instance.  
The **username** could form the _local-part_ of an email address within Caliopen's domain. (i.e. : _<username@caliopen.org>_)

NB : once an user has chosen an username, she/he will be able to create or add some « identities », that are made of : first name, family name, email, etc.

##### Format :
 
* Username are made of utf-8 "characters".  
By "character" we mean a single Unicode grapheme, encoded as a single Unicode code point.
* Username **is not** case sensitive. (means that all case variations of the username will be considered as forming the same username)
* Username **must** be at least 3 characters long, and up to 42 characters. (you should know why 42 ! ;-)
* Username is made of :
    * uppercase and lowercase Latin letters A to Z and a to z
    * digits 0 to 9
    * special characters `!#$%&'*+-/=?^_{|}~`
    * dot `.`, provided that it is not the first or last char, and provided also that it does not appear consecutively (e.g. John..Doe is not allowed but John.Doe is allowed)
    * In addition to the above ASCII characters, international characters above U+007F, encoded as UTF-8, are permitted
* Username **cannot** have invisible control characters and unused Unicode code points (`\p{C}` Unicode category)
* Usernane **cannot** have character intended to be combined with another character (e.g. accents, umlauts, enclosing boxes, etc.) (`\p{M}` Unicode category)
* Username **cannot** have modifier character, neither have modifier symbol as a full character on its own (`\p{Lm}` and `\p{Sk}` Unicode category)
* Username **cannot** contain those characters (unicode number):
    * whitespace (U+0020)
    * `"` (U+0022)
    * `,` (U+002C)
    * `@` (U+0040)
    *  `  (U+0060)
    * `:` (U+003A)
    * `;` (U+003B)
    * `<` (U+003C)
    * `>` (U+003E)
    * `[` (U+005B)
    * `\ ` (U+005C)
    * `]` (U+005D)

##### Technical overview
On a technical point of view, `username` is a string of utf-8 characters. In other words it is an array of _Unicode code point_, meaning that each character is encoded as a single Unicode code point. For example, the character `à` (grave accent) should be encoded as U+00E0, and **not** as the sequence of the two code points U+0061 (a) and U+0300 (\`).  
The regex engines used to validate the username string must be unicode aware/compliant. This means that the regex engines **must** make use of _Single Unicode Grapheme_, and must be able to handle _Unicode property escapes_ patterns (i.e.: `\p{category}`).

##### Regex :
Here is the general utf-8 PCRE regex implementation of the username format rules described above :
```
^[^\p{C}\p{M}\p{Lm}\p{Sk}\p{Z}.\x{0022},@\x{0060}:;<>[\\\]]((\.[^\p{C}\p{M}\p{Lm}\p{Sk}\p{Z}.\x{0022},@\x{0060}:;<>[\\\]]|[^\p{C}\p{M}\p{Lm}\p{Sk}\p{Z}.\x{0022},@\x{0060}:;<>[\\\]])){1,40}((\.[^\p{C}\p{M}\p{Lm}\p{Sk}\p{Z}.\x{0022},@\x{0060}:;<>[\\\]])|([^\p{C}\p{M}\p{Lm}\p{Sk}\p{Z}.\x{0022},@\x{0060}:;<>[\\\]]))$
```

##### Languages implementations :
###### Go
The PCRE regex is directly used, thanks to the `regexp` standard package.
```
package main

import (
    "regexp"
    "fmt"
)

func main() {
    var re = regexp.MustCompile(`^[^\p{C}\p{M}\p{Lm}\p{Sk}\p{Z}.\x{0022},@\x{0060}:;<>[\\\]]((\.[^\p{C}\p{M}\p{Lm}\p{Sk}\p{Z}.\x{0022},@\x{0060}:;<>[\\\]]|[^\p{C}\p{M}\p{Lm}\p{Sk}\p{Z}.\x{0022},@\x{0060}:;<>[\\\]])){1,40}((\.[^\p{C}\p{M}\p{Lm}\p{Sk}\p{Z}.\x{0022},@\x{0060}:;<>[\\\]])|([^\p{C}\p{M}\p{Lm}\p{Sk}\p{Z}.\x{0022},@\x{0060}:;<>[\\\]]))$`)
    var str = `John.Dœuf`
    
    for i, match := range re.FindAllString(str, -1) {
        fmt.Println(match, "found at index", i)
        return
    }
    fmt.Println("not found")
}
```
###### Python
Must install the "regex" package : `pip install regex`  
Must replace the `\x{0000}` unicode reference pattern by `\u0000`  
###### Note: for Python 2.7 compatibility, use ur"" to prefix the regex and u"" to prefix the test string and substitution.

```
# coding=utf8

import regex

r = ur"^[^\p{C}\p{M}\p{Lm}\p{Sk}\p{Z}.\u0022,@\u0060:;<>[\\\]]((\.[^\p{C}\p{M}\p{Lm}\p{Sk}\p{Z}.\u0022,@\u0060:;<>[\\\]]|[^\p{C}\p{M}\p{Lm}\p{Sk}\p{Z}.\u0022,@\u0060:;<>[\\\]])){1,40}((\.[^\p{C}\p{M}\p{Lm}\p{Sk}\p{Z}.\u0022,@\u0060:;<>[\\\]])|([^\p{C}\p{M}\p{Lm}\p{Sk}\p{Z}.\u0022,@\u0060:;<>[\\\]]))$"

username = u"John.Dœuf"

match = regex.search(r, username)

if match is not None:
    print("username is valid")
else:
    print("INVALID username")
```
###### Javascript
Built-in ECMAScript 6 regex implementation does not support the Unicode property escapes syntax. There are currently two options :

* Use a library such as [XRegExp](https://github.com/slevithan/xregexp) to create the regular expressions at run-time:  

    ```
    var XRegExp = require('xregexp');

    const x = XRegExp(/^[^\p{C}\p{M}\p{Lm}\p{Sk}\p{Z} .\u0022,@\u0060:;<>[\\\]]((\.[^\p{C}\p{M}\p{Lm}\p{Sk}\p{Z} .\u0022,@\u0060:;<>[\\\]]|[^\p{C}\p{M}\p{Lm}\p{Sk}\p{Z} .\u0022,@\u0060:;<>[\\\]])){1,40}((\.[^\p{C}\p{M}\p{Lm}\p{Sk}\p{Z} .\u0022,@\u0060:;<>[\\\]])|([^\p{C}\p{M}\p{Lm}\p{Sk}\p{Z} .\u0022,@\u0060:;<>[\\\]]))$/g);
    console.log(x.test('John.Dœuf'));
    // → true
    ```
    *NB : Need to double check this library implementation as it seems it is fautly (for example, whitespace characters are incorrectly accepted with the \p{Z} selector)*
* Use a library such as [Regenerate](https://github.com/mathiasbynens/regenerate) to generate the regular expression at build time.  
This approach results in optimal run-time performance, although the generated regular expressions tend to be fairly large in size (which could lead to load-time performance problems on the web). The biggest downside is that it requires a build script, which gets painful as the developer needs more Unicode-aware regular expressions. Whenever the Unicode Standard is updated, the build script must be updated and its results must be deployed in order to use the latest available data.