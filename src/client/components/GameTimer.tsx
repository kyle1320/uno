import * as React from "react";
import { connect } from "react-redux";
import { ClientStoreState } from "@redux-mc/util";

import * as Uno from "../../spec";

interface IProps {
  gameStartTime: number;
}

function getTimeString(millis: number) {
  millis = Math.floor(millis / 1000);
  const s = millis % 60;
  const m = Math.floor(millis / 60);

  return `${m}:${("00" + s).slice(-2)}`;
}

export default connect((state: ClientStoreState<Uno.Spec>) => ({
  gameStartTime: state.L1.startTime - state.meta.timeOffset
}))(function (props: IProps) {
  const [o, refresh] = React.useReducer(() => ({}), {});
  const duration = React.useMemo(() => Math.max(0, Date.now() - props.gameStartTime), [props.gameStartTime, o]);
  React.useEffect(function () {
    let timer: ReturnType<typeof setTimeout> | null = null;

    function tick() {
      timer = setTimeout(
        () => {
          refresh();
          tick();
        },
        1001 - ((Date.now() - props.gameStartTime) % 1000)
      );
    }

    tick();

    return () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };
  });
  return <>{getTimeString(duration)}</>;
});
