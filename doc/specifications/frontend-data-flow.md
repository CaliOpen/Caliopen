# Frontend data flow

Caliopen must offers a simple API for a simple concept:

1. The interface handles an user action
2. An action is launched, it does one or more calls to backend
3. The interface is able to display the state of this action
4. At the end the interface show the result of the action (success or error)


## Actions

Following this assomption, an action MUST be a Promise.
An action MAY be specific to a component.
An action MAY be related to one or more concept.
An action MAY be a serie of redux actions.
An action MUST return an entity or a collection of entity or throw an error.
An action MUST store the result of the action(s) in the state except for password related actions.

## State

The different parts of the state can be rendered anywhere at any time: a list of messages, a contact even if refreshing. It also can be the state of a request:

Loading more message from a discussion will display a spinner in a tab. Sending a message will display a spinner in the button.

**FIXME:** How to select loading action in a tab ?

Actions w/ business logic launch a redux action with the type of the action and an internal id (it can be a discussion_id or a simple string e.g `timeline`) And HoC or a render prop can select the state by passing the type and the id

## Redux

Redux actions are not meant to be used directly, and are ALWAYS a simple function retuning an object describing the action that MAY be parsed by the reducers.

A middleware is NEVER blocking EXCEPT if it changes the action (xhr requests ...).

## Cache

Is there a need for cache ?

Currently, some requesets are made multiple times instead of using the state, because the interface or an action has no idea if the state is fullfiled when it requires it.

For example, suggest execute an xhr to retrieves a list of participants and contacts. it requires to fetch contacts one by one even if its are already loaded.

A tab is created using messages from a discussion, the tab list is located in a other part of the application compared to the discussion.
