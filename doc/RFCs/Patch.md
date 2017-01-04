##Caliopen « Patch » RFC

##### Abstract
This specification defines the format of the JSON body that should be sent to the REST API to update a resource with the PATCH verb.

##### Introduction
This specification extends [RFC 7396](https://tools.ietf.org/html/rfc7396) by adding a `current_state` field to the JSON patch object.

##### Json patch object specification
The JSON should indicate the fields to be changed, with the desired value for these fields, as describe in RFC 7396  
**plus**  
a field called `current_state`.  
`current_state` is an object that describes the values of the fields as seen by the client, before the patch application.

### Examples :
Given the following document (client side) :
```
{
  "family_name": "Name",
  "user_id": "6d401236-99a8-4088-9ceb-4b6391482c4c",
  "title": "Old Title",
  "deleted": false,
  "privacy_index": 15,
  "contact_id": "d080232b-8ce2-49e0-bd7e-262ccf82a9d4",
  "date_insert": "2016-12-14T13:39:04.111000+00:00",
  "given_name": "",
  "emails": [
    {
      "email_id": "998ef52d-f3ba-4c8e-959e-0614ed80c255",
      "is_primary": false,
      "type": "work",
      "address": "old@domain.tld""
    }
  ],
  "avatar": "avatar.png"
}
```
To change the email address and the title, send the JSON below with `PATCH` verb on route `/contacts/{contact_id}` : 
```
{
  "title": "New Title",
  "emails": [
    {"address": "new@domain.tld", "type": "home"}
  ],
  "current_state": {
    "title": "Old Title",
    "emails": [
        {
          "email_id": "998ef52d-f3ba-4c8e-959e-0614ed80c255",
          "is_primary": false,
          "type": "work",
          "address": "old@domain.tld""
        }
    ]
  }
}
```
To add an email address to a contact that does not have any email, they are two options : either put nothing within `current_state` or put an empty array :

* Option 1 : put an empty array in `current_state`

```
{
  "emails": [
    {"address": "local@domain.tld"}
  ],
  "current_state": {
    "emails": []
  }
}
```
* Option 2 : omit key in `current_state`
```
{
  "emails": [
    {"address": "local@domain.tld"}
  ],
  "current_state": {}
}
```