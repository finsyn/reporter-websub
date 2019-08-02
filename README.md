# WebSub reporter

Manages [WebSub] subscriptions and incoming content for Finsyn.

## Usage
The cloud components need to be enabled and some enviroment variables need to be set:

- `WEBSUB_SUBSCRIBER_SECRET`: passed to hub so it can sign the messages and let us verify that incoming messages were intented for us 
- `WEBSUB_CALLBACK_ORIGIN`: origin of the hosted callback service

A small util script is available for subscription management

### Create subscription
```bash
./bin/subscription create <hub> <topic>
```

For debugging purposes you can run a local instance of the callback service like this:

```bash
./bin/callback serve
```

## Cloud Components used

### GCP Datastore
Keeps track of active subscriptions

### GCP Cloud Functions
Hosts the subscriber webhook used by all subscribers

### GCP PubSub 
Parsed incoming content is broadcasted to a PubSub topic for further processing by different Finsyn services

[WebSub]: https://www.w3.org/TR/websub/
[GCP Datastore]: https://cloud.google.com/datastore/
[GCP Cloud Functions]: https://cloud.google.com/functions/


