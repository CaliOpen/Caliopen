# -*- coding: utf-8 -*-
from __future__ import absolute_import, print_function, unicode_literals

import regex


def is_valid_username(username):
    """ conforms to doc/RFCs/username_specifications"""

    rgx = ur"^[^\p{C}\p{M}\p{Lm}\p{Sk}\p{Z}.\u0022,@\u0060:;<>[\\\]]" \
          ur"((\.[^\p{C}\p{M}\p{Lm}\p{Sk}\p{Z}.\u0022,@\u0060:;<>[\\\]]|" \
          ur"[^\p{C}\p{M}\p{Lm}\p{Sk}\p{Z}.\u0022,@\u0060:;<>[\\\]])){1,40}" \
          ur"((\.[^\p{C}\p{M}\p{Lm}\p{Sk}\p{Z}.\u0022,@\u0060:;<>[\\\]])|" \
          ur"([^\p{C}\p{M}\p{Lm}\p{Sk}\p{Z}.\u0022,@\u0060:;<>[\\\]]))$"

    match = regex.search(rgx, username)
    if match is None:
        raise SyntaxError
