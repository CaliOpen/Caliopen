var caliopen_api =
{
    "swagger": "2.0",
    "info": {
        "version": "0.0.2",
        "title": "Caliopen User API"
    },
    "host": "localhost:6543",
    "schemes": [
        "http"
    ],
    "basePath": "/api/v1",
    "paths": {
        "/authentications": {
            "post": {
                "description": "return auth token to build basicAuth, for given credentials",
                "tags": [
                    "users"
                ],
                "parameters": [
                    {
                        "name": "username",
                        "in": "query",
                        "type": "string"
                    },
                    {
                        "name": "password",
                        "in": "query",
                        "type": "string"
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Successful authentication"
                    }
                }
            }
        },
        "/me": {
            "get": {
                "description": "Gets `user + contact` objects for current logged-in user\n",
                "produces": [
                    "application/json"
                ],
                "security": [
                    {
                        "basicAuth": []
                    }
                ],
                "tags": [
                    "users"
                ],
                "parameters": [
                    {
                        "name": "X-Caliopen-PI",
                        "in": "header",
                        "required": true,
                        "description": "The PI range requested in form of \"1;100\"",
                        "type": "string"
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Successful response",
                        "schema": {
                            "$ref": "#/definitions/User"
                        }
                    }
                }
            }
        }
    },
    "definitions": {
        "User": {
            "type": "object",
            "properties": {
                "user_id": {
                    "type": "string"
                },
                "main_user_id": {
                    "type": "string"
                },
                "family_name": {
                    "type": "string"
                },
                "name": {
                    "type": "string"
                },
                "given_name": {
                    "type": "string"
                },
                "privacy_features": {
                    "$ref": "#/definitions/Privacy_features"
                },
                "privacy_index": {
                    "type": "integer",
                    "format": "int32"
                },
                "date_insert": {
                    "type": "string"
                },
                "contact": {
                    "$ref": "#/definitions/Contact"
                },
                "params": {
                    "type": "object"
                }
            }
        },
        "Contact": {
            "type": "object",
            "properties": {
                "addresses": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/Address"
                    }
                },
                "privacy_features": {
                    "$ref": "#/definitions/Privacy_features"
                },
                "phones": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                },
                "contact_id": {
                    "type": "string"
                },
                "date_insert": {
                    "type": "string"
                },
                "identities": {
                    "type": "array",
                    "items": {
                        "type": "object"
                    }
                },
                "user_id": {
                    "type": "string"
                },
                "title": {
                    "type": "string"
                },
                "additional_name": {
                    "type": "string"
                },
                "date_update": {
                    "type": "string"
                },
                "organizations": {
                    "type": "array",
                    "items": {
                        "type": "object"
                    }
                },
                "ims": {
                    "type": "array",
                    "items": {
                        "type": "object"
                    }
                },
                "given_name": {
                    "type": "string"
                },
                "name_prefix": {
                    "type": "string"
                },
                "tags": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                },
                "deleted": {
                    "type": "integer",
                    "format": "int32"
                },
                "privacy_index": {
                    "type": "integer",
                    "format": "int32"
                },
                "groups": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                },
                "infos": {
                    "type": "object"
                },
                "emails": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/Email"
                    }
                },
                "family_name": {
                    "type": "string"
                },
                "name_suffix": {
                    "type": "string"
                },
                "avatar": {
                    "type": "string"
                },
                "publick_key": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                }
            }
        },
        "Address": {
            "type": "object"
        },
        "Privacy_features": {
            "type": "object"
        },
        "Email": {
            "type": "object",
            "properties": {
                "email_id": {
                    "type": "string"
                },
                "is_primary": {
                    "type": "boolean"
                },
                "label": {
                    "type": "string"
                },
                "type": {
                    "type": "string"
                },
                "address": {
                    "type": "string"
                }
            }
        }
    },
    "securityDefinitions": {
        "basicAuth": {
            "type": "basic",
            "description": "HTTP Basic Authentication. `Password` is the `access_token` return by /authentications and `Username` is the `user_id` returned by /authentications"
        }
    }
};
