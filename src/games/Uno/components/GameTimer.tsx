import * as React from 'react';
import { connect } from 'react-redux';

import { UnoSpec } from '..';
import { state } from '../../../types';

interface IProps {
  gameStartTime: number;
}

function getTimeString(millis: number) {
 millis = Math.floor(millis / 1000);
 const s = millis % 60;
 const m = Math.floor(millis / 60);

 return `${m}:${("00" + s).slice(-2)}`;
}

export default connect(
  (state: state.ClientSide<UnoSpec>) => ({
    gameStartTime: state.l1.startTime - state.timeOffset
  })
)(function (props: IProps) {
  const [o, refresh] = React.useReducer(() => ({}), {});
  const duration = React.useMemo(
    () => Date.now() - props.gameStartTime,
    [props.gameStartTime, o]
  );
  React.useEffect(function () {
    let timer: NodeJS.Timer | null = null;

    function tick() {
      timer = setTimeout(() => {
        refresh();
        tick();
      }, 1001 - (Date.now() - props.gameStartTime) % 1000);
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