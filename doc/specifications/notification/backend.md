# Caliopen emisssion de notification(s) *

En reference du [document](./API-fr.md) voici comment doivent etre crees les differentes notifications a destination de l'utilisateur.

## Etat actuel ##

Les evenements suivants generent actuellement une notification utilisateur :
- arrivee d'un email
- un message imap externes a ete traite
- un dm twitter a ete traite

Cela genere beaucoup de notifications.

## Gestion d'une identite externe ##

Une notification doit etre emise globalement par rapport a un traitement avec une identite externe (imap, twitter, ...)
si des nouveaux messages ont ete recuperes.

```
emmiter = "<worker_name>"
body = {"received_messages": [
	{"message_id": "xxx", 
	"discussion_id": "yyy"}
]}
```

## Reception mail SMTP ##

Envoi d'une notification a chaque reception via SMTP

```
emmiter = "smtp"

body = {"message_id": "xxx", 
		"discussion_id": "yyy",
		"identity_id": "zzz"}

```

## Import fichier vcard ##

Envoi d'une notification globale a la fin du traitement d'import d'un fichier vcard

```
emmiter = "vcard_import"

body = {"totals: {"read": 9,
		          "imported": 8,
		          "conflict", 1},
		"conflicts": [{"uris": ["existing@email.something"], "contact_id": "xxxx-yyyy-zzzz"}]
```
