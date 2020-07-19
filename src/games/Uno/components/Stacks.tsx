import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { UnoSpec, Req } from '..';
import { state, ClientGameActions } from '../../../types';
import { Card as CardType } from '../common';
import { Card } from './Card';

import './Stacks.scss';

interface IProps {
  upStackSize: number;
  downStackSize: number;
  topCard: CardType | null;

  draw: () => void;
}

export function Stacks(props: IProps) {
  return <div className="stacks">
    <div className="down-stack">
      {props.topCard
        ? <Card {...props.topCard} />
        : <Card color="gray" value="empty" />}
      <div className="number"> {props.downStackSize}</div>
    </div>
    <div className="up-stack" onClick={props.draw}>
      <Card turned={true} color="black" value="back" />
      <div className="number"> {props.upStackSize}</div>
    </div>
  </div>;
}

export default connect(
  (state: state.ClientSide<UnoSpec>) => ({
    upStackSize: state.l1.upStackSize,
    downStackSize: state.l1.downStackSize,
    topCard: state.l1.topCard
  }),
  (dispatch: Dispatch<ClientGameActions<UnoSpec>>) => ({
    draw: () => dispatch(Req.actions.drawCard())
  })
)(Stacks);
