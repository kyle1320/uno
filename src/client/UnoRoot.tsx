import * as React from "react";
import { Provider } from "react-redux";
import { useParams } from "react-router-dom";

import { UnoClient } from "./UnoClient";
import Uno from "./components/Uno";

export function UnoRoot() {
  const { roomName } = useParams();

  if (!roomName) {
    return null;
  }
  const client = React.useMemo(() => new UnoClient(roomName), [roomName]);

  React.useEffect(() => {
    localStorage.setItem("savedRoomName", roomName);
  }, [roomName]);

  React.useEffect(() => {
    (window as any).uno = client;
    client.connect();

    return () => {
      delete (window as any).uno;
      client.dispose();
    };
  }, [client]);

  return (
    <Provider store={client.store}>
      <Uno />
    </Provider>
  );
}
