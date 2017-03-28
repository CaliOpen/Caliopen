##### Routes pour les drafts :


* `POST /messages` : création d'un draft
    * ou `POST /drafts` ?
* `PATCH /messages/{message_id}` : actualisation d'un draft
* `DELETE /messages/{message_id}` : suppression d'un draft
* `POST (ou PATCH?) /messages/{message_id}/send` : ordre d'envoi d'un draft (payload empty pour le moment, pourra ultérieurement contenir des instructions d'envoi par exemple : envoyer à une certaine date/heure)
    * ou `POST (ou PATCH?) /messages/{message_id}/action`, avec un json en payload qui décrit l'action à accomplir : send pour le draft, read/unread, etc. pour les autres messages. Cette solution présente l'avantage d'avoin une seule route pour toutes les actions permises sur les messages. Exemple de payload possible : `{"action":"send"}`


[Il faudra ultérieurement prévoir des routes pour la gestion des pièces jointes : upload, delete, attach, detach…]

##### Routes messages/discussions :

* `GET /messages?` : une liste de messages selon les critères du filtre.  
règles de filtrage envisageables :
```
    discussion_id=
    caliopen-pi=
    limit=
    offset=
    et aussi : [unread, flag, date_before, date_after, from etc.] 
    (avec des opérateurs OR, AND, NOT, SORT ?), puis plus tard la notion de 'view', c'est-à-dire les infos qu'on veut récupérer (par exemple view=count pour ne recevoir qu'un décompte du nombre de messages qui répondent au filtre)
``` 

* `GET /messages/{message_id}` : récupération d'un message
* `POST (ou PATCH?) /messages/{message_id}/action` (avec la description de l'action à accomplir dans le payload json). Ou bien une route différente pour chaque action `/send`, `/read`, `/unread`, etc. ?
* `GET /discussions?` : retourne la liste des discussions de l'utilisateur selon les règles du filtre.  
Règles de filtrage envisageables : 

```
    caliopen-pi=
    limit=
    offset=
    et aussi : [unread, date_before, date_after…]
```

##### Route nécessaire pour la création d'un draft : `/identities/locals`
pour permettre à l'appli front de récupérer les identities du user.  
Pour l'instant, la route ne fera que retourner l'unique local identity créee par défaut.