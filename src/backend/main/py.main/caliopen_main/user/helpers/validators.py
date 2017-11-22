# -*- coding: utf-8 -*-
from __future__ import absolute_import, print_function, unicode_literals

import regex


def is_valid_username(username):
    """ conforms to doc/RFCs/username_specifications"""

    rgx = r"^[^\p{C}\p{M}\p{Lm}\p{Sk}\p{Z}.\u0022,@\u0060:;<>\[\\\]]" \
          r"((\.[^\p{C}\p{M}\p{Lm}\p{Sk}\p{Z}.\u0022,@\u0060:;<>\[\\\]]|" \
          r"[^\p{C}\p{M}\p{Lm}\p{Sk}\p{Z}.\u0022,@\u0060:;<>\[\\\]])){1,40}" \
          r"((\.[^\p{C}\p{M}\p{Lm}\p{Sk}\p{Z}.\u0022,@\u0060:;<>\[\\\]])|" \
          r"([^\p{C}\p{M}\p{Lm}\p{Sk}\p{Z}.\u0022,@\u0060:;<>\[\\\]]))$"

    r = regex.compile(rgx, flags=regex.V1+regex.UNICODE)

    if r.match(username) is None:
        raise SyntaxError


def main():
    try:
        is_valid_username("0123❤xxx___the______johnΔœuf")
    except:
        print("username NOT valid")
        return

    print("username OK")


if __name__ == '__main__':
    main()
