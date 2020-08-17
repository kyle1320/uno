import * as React from 'react';
import { connect } from 'react-redux';

import { UnoSpec } from '..';
import { state } from '../../../types';

interface IProps {
  turnEndTime: number;
}

function getTimeString(millis: number) {
  millis = Math.ceil(millis / 1000);
  const s = millis % 60;
  const m = Math.floor(millis / 60);

  return `${m}:${('00' + s).slice(-2)}`;
}

export default connect((state: state.ClientSide<UnoSpec>) => ({
  turnEndTime: state.l1.turnTimeout - state.timeOffset
}))(function (props: IProps) {
  const [o, refresh] = React.useReducer(() => ({}), {});
  const duration = React.useMemo(
    () => Math.max(0, props.turnEndTime - Date.now()),
    [props.turnEndTime, o]
  );
  React.useEffect(function () {
    let timer: NodeJS.Timer | null = null;

    function tick() {
      timer = setTimeout(() => {
        refresh();
        tick();
      }, 1 + ((Date.now() - props.turnEndTime) % 1000));
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
