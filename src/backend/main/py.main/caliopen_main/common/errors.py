
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


class ObjectInitFailed(Exception):

    """Exception when __init__ func failed to process object initialization"""

    def __init__(self, message=None, **kw):
        Exception.__init__(self, message, **kw)


class ForbiddenAction(Exception):
    """ Exception when an user tries to do something forbidden
    
        because of insufficient rights
        or because action is not allowed on a specific object or attribute
    """

    def __init__(self, message=None, **kw):
        Exception.__init__(self, message, **kw)

