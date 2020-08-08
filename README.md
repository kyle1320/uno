# Kyle's Uno

A multiplayer web-based Uno clone.

### Goals

- Easy-to-use rooms for multiplayer games
- Secure -- clients can't cheat
- Reusable framework to make future games easier

## Technologies

Uses React / Redux on the front-end, and Express / Redux on the back-end.

To keep things secure so clients can't cheat, State / Actions / Reducers / Middleware are split into the following five "levels":

| Level | Description        | Who has read / write access                                  |
| ----- | ------------------ | ------------------------------------------------------------ |
| L0    | **Server Private** | only server                                                  |
| L1    | **Server Shared**  | only server can modify, shared with all clients              |
| L2    | **Client**         | only server can modify, unique to each client                |
| L3    | **Client Shared**  | both client & server can read / write, unique to each client |
| L4    | **Client Private** | only client                                                  |

In addition there are two classes of actions with no dedicated state:

- **Core:** Internal actions for e.g. setting up the connection
- **Request:** Client-created actions used to request server actions

### State

The server maintains one copy of L0 and L1 state, and a copy of L2 and L3 for each client. Thus the server state looks something like this:

```javascript
{
   l0: { ... },
   l1: { ... },
   l2: {
      client_id1: { ... },
      client_id2: { ... }
   },
   l3: {
      client_id1: { ... },
      client_id2: { ... }
   }
}
```

Each client maintains one copy of L1, L2, L3, and L4 state. Thus the client state looks something like this:

```javascript
{
   l1: { ... },
   l2: { ... },
   l3: { ... },
   l4: { ... }
}
```

### Actions

Every action is tagged with a "kind". This can be one of the levels L0-L4, "Core", or "Req" (Request).

Core actions are used by both client & server for tasks like connecting, requesting initial state, and measuring latency.

The server can perform actions on L0-L3. These actions are shared with connected clients as appropriate -- L0 actions are not sent, L1 actions are sent to every client, and L2/L3 actions are only sent to clients with a matching id.

The client can perform actions on L1-L4, as well as "Requests". Requests are what they sound like -- requests to the server to perform an action, usually on L1 or L2 state. This is meant to allow the server to perform checks on what action the client is requesting, to help prevent cheating.

Notice that the client applies L1 and L2 actions received from the server in order to keep its own copies of this state up-to-date, but it cannot modify them -- or at least if it tried, those modifications wouldn't make it to the server state or to other clients.

### Reducers

// talk about shared reducers

### Middleware

// communication across levels
