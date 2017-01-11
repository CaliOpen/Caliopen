#### _Username_ specifications for Caliopen accounts

This document describes valid **username** for the creation of an account within Caliopen instances.

#### Preambule
Living in the XXI century, Caliopen's users should be able to take (almost) any username they want to. The following specifications are as open as possible.

##### Definition :
An **username** is the unique identifier an user makes use of to create an account within a Caliopen instance. 
Username is only an identifier for the user's account : it is not necessarily the user's real name, or email, or nickname… It will only be used as a credential for the purpose of identifying the user when logging in Caliopen. The username is unique within a Caliopen instance.

NB : once an user has chosen an _username_, she/he will be able to create or add some « identities », that are made of : first name, family name, email, etc.

##### Format :
 
* Username are made of utf-8 "characters".  
By "character" we mean a single Unicode grapheme, encoded as a single Unicode code point.
* Username **is** case sensitive.
* Username **must** be at least 3 characters long, and up to 42 characters. (you should know why 42 ! ;-)
* Username **cannot** have invisible control characters and unused Unicode code points (`\p{C}` Unicode category)
* Usernane **cannot** have character intended to be combined with another character (e.g. accents, umlauts, enclosing boxes, etc.) (`\p{M}` Unicode category)
* Username **cannot** have modifier character, neither have modifier symbol as a full character on its own (`\p{Lm}` and `\p{Sk}` Unicode category)
* Username **cannot** have a whitespace at the first or at the last position character.

##### Technical overview
On a technical point of view, `username` is a string of utf-8 characters. In other words it is an array of _Unicode code point_, meaning that each character is encoded as a single Unicode code point. For example, the character `à` (grave accent) should be encoded as U+00E0, and **not** as the sequence of the two code points U+0061 (a) and U+0300 (\`).  
The regex engines used to validate the username string must be utf-8 compliant. This means that the regex engines **must** make use of _Single Unicode Grapheme_ match patterns of **single** code point, using the `\p{category}` (PERL) syntax for example.

##### Regex :
Here is the general PERL regex implementation of the username format rules described above :
```
^[^\p{C}\p{M}\p{Lm}\p{Sk}\p{Zs}][^\p{C}\p{M}\p{Lm}\p{Sk}]{1,40}[^\p{C}\p{M}\p{Lm}\p{Sk}\p{Zs}]$
```

##### Languages implementations :
###### Javascript
Built-in ECMAScript 6 regex implementation with the `u` flag.
###### Python
Need to install the regex package : `pip install regex`

```
# coding=utf8

import regex

r = r"^[^\p{C}\p{M}\p{Lm}\p{Sk}\p{Zs}][^\p{C}\p{M}\p{Lm}\p{Sk}]{1,40}[^\p{C}\p{M}\p{Lm}\p{Sk}\p{Zs}]$"

test_str = u"dev@caliopen.local"

matches = regex.finditer(r, test_str)


for matchNum, match in enumerate(matches):
    matchNum + 1

    print("Match {matchNum} was found at {start}-{end}: {match}".format(matchNum = matchNum, start = match.start(), end = match.end(), match = match.group()))

    for groupNum in range(0, len(match.groups())):
        groupNum = groupNum + 1

        print("Group {groupNum} found at {start}-{end}: {group}".format(groupNum = groupNum, start = match.start(groupNum), end = match.end(groupNum), group = match.group(groupNum)))

# Note: for Python 2.7 compatibility, use ur"" to prefix the regex and u"" to prefix the test string and substitution.

```
###### Go
Need to import he standard package `regexp`.
```
package main

import (
    "regexp"
    "fmt"
)

func main() {
    var re = regexp.MustCompile(`^[^\p{C}\p{M}\p{Lm}\p{Sk}\p{Zs}][^\p{C}\p{M}\p{Lm}\p{Sk}]{1,40}[^\p{C}\p{M}\p{Lm}\p{Sk}\p{Zs}]$`)
    var str = `dev@caliopen.local`
    
    for i, match := range re.FindAllString(str, -1) {
        fmt.Println(match, "found at index", i)
    }
}
```
