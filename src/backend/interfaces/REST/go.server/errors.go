package rest_api

type (
        Errors []Error

        Error struct {
                // An error supports zero or more field names, because an
                // error can morph three ways: (1) it can indicate something
                // wrong with the request as a whole, (2) it can point to a
                // specific problem with a particular input field, or (3) it
                // can span multiple related input fields.
                FieldNames []string `json:"fieldNames,omitempty"`

                // The classification is like an error code, convenient to
                // use when processing or categorizing an error programmatically.
                // It may also be called the "kind" of error.
                Classification string `json:"classification,omitempty"`

                // Message should be human-readable and detailed enough to
                // pinpoint and resolve the problem, but it should be brief. For
                // example, a payload of 100 objects in a JSON array might have
                // an error in the 41st object. The message should help the
                // end user find and fix the error with their request.
                Message string `json:"message,omitempty"`
        }
)
