# Caliopen #

## Notifications

### Objectif de ce document :

Décrire le format des messages échangés entre le frontend et le backend

Décrire le protocole utilisé pour l'échange de ces messages

Lister les fonctionnalités de notification exposées par le backend pour le frontend (API)

Décrire le mode de gestion de la file d'attente des notifications côté backend

### Format des messages de notification :
###### format de la réponse retournée par le backend sur /api/v2/notifications :

```yaml  
notifications:  
  - from: string         // backend entity that's emitting the message. (contacts facility, email facility, etc.)  
    to: string           // frontend service/component to which message is sent. (api-location, api-patch, contact, event-manager, etc.)  
    id: string           // universally unique id to unambiguously identify a notification message.  
    type: string         // a single word to describe message's type and give indication of importance level (event, info, feedback, warning, teaser, error, alert, etc.)  
    reference: string    // (optional) a reference number previously sent by frontend to link current notification to a previous action/event.  
    timestamp: int       // unix timestamp at which backend created the notification  
    body: string         // could be a simple word or a more complex structure like a json, depending of the notification.  
```

##### Les messages de notification comportent des 'headers' et un 'body'.

les 'headers' (`from`, `to`, `id`, `type`, `references`) permettent d'identifier la notification et de la classifier.

le `body` comporte le message/payload de la notification

les headers `from` et `to` servent à identifier les composants du backend (from) et du frontend (to) concernés par la notification.

le header `type` permet d'identifier immédiatement le type de notification : event, info, feedback, warning, teaser, error, alert, etc.

le header `reference` pourrait servir à lier une notification à un évènement ou une action initiée par le front afin que celui identifie le feedback du backend sur le déroulement de cette action.

le header `timestamp` est le timestamp unix du moment où la notification a été créée par le backend. Il pourrait permettre au frontend d'indiquer une fourchette horaire lors du `GET /v2/nofications?from=00000000&to=000000000`



#### Exemples de notifications :

##### notification de réception de email(s) :

```yaml  
notifications:  
  - from: email-facility  
    to: message-component  
    id: xxxxx-xxxxx-xxxxx  
    type: event  
    timestamp: 1518691674517  
    body:  
      emailReceived: xxxxxx-xxxxx-xxxxx // uuid of new email  
  - from: email-facility  
    to: message-component  
    id: xxxxx-xxxxx-xxxxx  
    type: event  
    timestamp: 1518691674517  
    body:  
      emailReceived: xxxxxx-xxxxx-xxxxx // uuid of new email  
  - from: email-facility  
    to: message-component  
    id: xxxxx-xxxxx-xxxxx  
    type: event  
    timestamp: 1518691674517  
    body:  
      emailReceived: xxxxxx-xxxxx-xxxxx // uuid of new email  
```

##### notification de fin d'import de vCards :

le frontend a initié un import avec un POST  sur /v1/imports

lors de son prochain call sur GET /v2/notifications, il pourrait recevoir la notification suivante :

```yaml  
notifications:  
  - from: contact-facility  
    to: browser-notification  
    id: xxxxxx-xxxxx-xxxxx  
    type: feedback  
    reference: xxxxxxxxx     // could be a hash of the initial call to the API (POST /v1/imports + timestamp (+ headers ?))  
    timestamp: 1518691674517  
    body: success  
```

##### notification d'échec d'envoi de email :

l'utilisateur a envoyé un email (`POST /messages/{message_id}/actions`)

lors de son prochain call sur GET /v2/notifications, le frontend pourrait recevoir la notification suivante :

```yaml  
notifications:  
  - from: email-facility  
    to: message-component  
    id: xxxxx-xxxxx-xxxxx  
    type: warning  
    reference: xxxxxx-xxxxx-xxxx // uuid of email sent  
    timestamp: 1518691674517  
    body:  
      warning: sending email failed  
      code: 23  
      message: MTA timeout  
```

##### notification que l'index est à jour (suite à create/update de document)

l'utilisateur a modifié un contact (`PATCH /contacts/{contact_id}`)

lors de son prochain call sur GET /v2/notifications, le frontend pourrait recevoir la notification suivante :

```yaml  
notifications:  
  - from: contact-facility  
    to: event-manager  
    id: xxxxx-xxxxx-xxxxx  
    type: info  
    reference: xxxxxx-xxxxx-xxxx // uuid of contact modified  
    timestamp: 1518691674517  
    body: indexed  
```

##### notification de ludification:

```yaml  
notifications:  
  - from: notification-center  
    to: browser-notification  
    id: xxxxx-xxxxx-xxxxx  
    type: teaser  
    timestamp: 1518691674517  
    body: Pour améliorer votre PI vous pourriez faire ceci…  
```

En l'absence de filtre lors du call sur `/api/v2/notifications`, toutes les notifications en instance sont envoyées dans la réponse :

```yaml  
notifications:  
  - from: email-facility  
    to: message-component  
    id: xxxxx-xxxxx-xxxxx  
    type: event  
    timestamp: 1518691674517  
    body:  
      - emailReceived: xxxxxx-xxxxx-xxxxx   
  - from: contact-facility  
    to: browser-notification  
    id: xxxxxx-xxxxx-xxxxx  
    type: feedback  
    reference: xxxxxxxxx      
    timestamp: 1518691674517  
    body: success  
  - from: email-facility  
    to: message-component  
    id: xxxxx-xxxxx-xxxxx  
    type: event  
    timestamp: 1518691674517  
    body:  
      emailReceived: xxxxxx-xxxxx-xxxxx // uuid of new email  
  - from: email-facility  
    to: message-component  
    id: xxxxx-xxxxx-xxxxx  
    type: event  
    timestamp: 1518691674517  
    body:  
      emailReceived: xxxxxx-xxxxx-xxxxx // uuid of new email  
  - from: notification-center  
    to: browser-notification  
    id: xxxxx-xxxxx-xxxxx  
    type: teaser  
    timestamp: 1518691674517  
    body: Pour améliorer votre PI vous pourriez faire ceci…  
```

### Protocole :

Le frontend fait des requêtes HTTP (GET ou DELETE) sur /api/v2/notifications.

Le serveur répond avec un payload en JSON et ferme la connexion.

### Endpoint et API :

#### endpoint : `…/api/v2/notifications`

#### méthodes : 

`GET` pour obtenir des notifications en file d'attente :

- sans params dans la query, toutes les notifications de la file d'attente sont retournées dans un seul document.
- 2 params optionnels : `from` et `to` pour filtrer les notifications par timestamp.

`DELETE` pour supprimer des notifications de la file d'attente

- 1 param obligatoire : `until` pour indiquer jusqu'à quel timestamp les notifications doivent être supprimées.

#### spécifications (swagger) : voir [/src/backend/defs/rest-api/paths/notifications.yaml](/src/backend/defs/rest-api/paths/notifications.yaml)

### Principe de fonctionnement :

#### Backend :

Le backend gère une pile de notifications pour chaque utilisateur.

- De nouvelles notifications sont créées et ajoutées à la pile par le backend en fonction d'actions de l'utilisateur (création d'un contact par ex.), d'événements extérieurs (arrivée d'un nouvel email par ex.),de traitements batch, etc.

Chaque notification à une durée de vie (TTL) prédéfinie dans la pile, en fonction de son niveau d'importance.

Par conséquent, la pile de notifications est automatiquement purgée.

#### Frontend:

Lors d'un call `GET` du frontend, la pile de toutes les notifications en instance est envoyée.

Le frontend peut refaire un `GET` xx secondes plus tard, il aura la même pile de notifications +/- les notifications arrivées entre-temps et celles qui ont expirées.

Le frontend peut refaire un `GET` xx secondes plus tard en ajoutant le param from=xxxxxxx pour ne recevoir que les dernières notifications arrivées depuis son dernier call (ou depuis le timestamp de la notification la plus récente qu'il a reçu lors du dernier call)

Le frontend peut explicitement purger la pile de notifications côté backend en faisant un call `DELETE` avec le param `until`

### Modèle de données :

La table des notifications est stockées dans cassandra.

#### Chaque `INSERT` se fera avec la directive `USING TTL xx` pour gérer le nettoyage automatique de la table

```sql  
CREATE TABLE user_notification (  
user_id uuid,  
timestamp timestamp,  
id uuid,  
type ascii,  
n_from text,  
n_to text,  
reference text,  
body blob,  
primary key(user_id, timestamp, id));  
```

Ces `primary keys` permettent de retrouver/supprimer toutes les notifications d'un utilisateur, ou celles d'un utilisateur dans un range de timestamp.

