
class PatchUnprocessable(Exception):
    """Exception when patch dict is malformed or unprocessable."""

    def __init__(self, message=None, **kw):
        Exception.__init__(self, message, **kw)


class PatchError(Exception):

    """Exception when processing patch was unsuccessfull"""

    def __init__(self, message=None, **kw):
        Exception.__init__(self, message, **kw)


class PatchConflict(Exception):

    """Exception when processing patch was unsuccessfull"""

    def __init__(self, message=None, **kw):
        Exception.__init__(self, message, **kw)