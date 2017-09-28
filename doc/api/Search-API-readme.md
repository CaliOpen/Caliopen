## Search API documentation

###### How frontend should use `/api/v2/search` API to retrieve documents.

#####REQUEST:
For now, search API is triggered by a simple `GET` with few query params :

- ##### Mandatory header : `X-Caliopen-IL`
    - the header is always required, *but* only taken into account if `doctype=message`.
    - default values : -10;10
- ##### Mandatory param : `term`
    - Example : `http://localhost:31415/api/v2/search?term=caliopdev`
    - This is the simplier request. It will trigger a fulltext search across all document types on all fields for the word « **caliopdev** ».
    - **NB**: API doesn't handle wildcards for now; i.e. a search with the term « caliop* » will not find documents with « caliopdev » or « caliopen ».
- ##### Optional params : `field`
    - Example : `http://localhost:31415/api/v2/search?term=meeting&field=subject`
    - `field` is name of a field on which to perform the search. If omitted defaults to « _all ».
    - This request will trigger a search for the word « meeting » in a field « subject » in all kind of documents.
    - **NB** : only one `field` param allowed for now.
- ##### Special param : `doctype`
    - Example : `http://localhost:31415/api/v2/search?term=caliopdev&doctype=message`
    - This request will narrow the search to documents of type « message ». Allowed `doctype` are « message » or « contact » for now.
    - Within the context of a `doctype` search, and only in this context, two more params are allowed, and can be combined :
        - `limit` : to limit the number of documents returned.
            - ex. : `http://localhost:31415/api/v2/search?term=caliopen&doctype=message&limit=5`
            - default to 10.
        - `offset` : to skip documents from response.
            - ex : `http://localhost:31415/api/v2/search?term=caliopen&doctype=message&offset=5`
            - default to 0.
#####RESPONSES:
Whatever the request is, the response has always the same schema :

```
{
    "total": 0,
    "messages_hits": {
        "total": 0,
        "messages": [
                     {
                        "id": "xxxxx",
                        "score": 3.374578,
                        "highlights": {
                            "a_field_name": ["a string", "another string"],
                            "another_field_name": ["string","string"]
                        },
                        "document": { // full message doc here }
                      },
                      { // another message }
        ]
    },
    "contact_hits": {
        "total": 0,
        "contacts": [
                      {
                        "id": "xxxx,
                        "score": 4.625036,
                        "highlights": {
                            "field_name": ["string"],
                            "another_field": ["string"]
                        },
                        "document": { // full contact doc here },
                      },
                        { // another contact }
        ]
    }
}
```

`total` fields always count how many docs have been found for the current search, whatever the actual number of docs are effectively returned.

`messages` and `contacts` arrays hold the documents matching the request. How many documents are in these arrays depends of the request context: 
- if no `doctype` param has been provided in the request, arrays contain the top 5 relevant documents for each type.
- if `doctype` param has been provided in the request, one array is empty (the one that do not match the `doctype` requested), other one holds has many documents as `limit` param, or 10 by default.
- documents are sorted by relevance.