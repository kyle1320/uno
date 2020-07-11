State / Actions / Reducers / Middleware are split into five "levels":

0: Server Private -- only server has read / write access
1: Server Shared  -- only server can modify, copied to all clients
2: Client         -- only server can modify, shared with just a single client
3: Client Shared  -- both client & server have read & write access
4: Client Private -- only client has read / write access

In addition there are two classes of actions with no dedicated state:
Core:    Internal actions for handling
Request: Client-created actions to request server actions

The following pieces must be created (state / actions / reducers / middleware):

   S  | A  | R  | M
--------------------
0: S_ | S_ | S_ | __
1: SC | SC | SC | __
2: SC | SC | SC | __
3: SC | SC | SC | S_
4: _C | _C | _C | __
5: __ | SC | __ | S_