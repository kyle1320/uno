import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { UnoSpec, L3, Req } from '..';
import { state, ClientGameActions } from '../../../types';

import './Menu.scss';

interface IProps {
  name: string;
  setName: (name: string) => void;
  resetGame: () => void;
}

export function Menu(props: IProps) {
  const [open, toggle] = React.useReducer(x => !x, false);

  return <div className={`menu-container${open ? ' open' : '' }`} onClick={toggle}>
    <div className="menu" onClick={e => e.stopPropagation()}>
      <div className="menu-icon" onClick={toggle}>
        <div className="line1" />
        <div className="line2" />
        <div className="line3" />
      </div>
      <div className="row">
        Name <input
          type="text"
          value={props.name}
          onChange={React.useCallback(
            e => props.setName(e.target.value),
            [props.setName]
          )} />
      </div>
      <button className="bottom" onClick={props.resetGame}>New Game</button>
    </div>
  </div>;
}

export default connect(
  (state: state.ClientSide<UnoSpec>) => ({
    name: state.l3.name
  }),
  (dispatch: Dispatch<ClientGameActions<UnoSpec>>) => ({
    setName: (name: string) => dispatch(L3.actions.setName(name)),
    resetGame: () => dispatch(Req.actions.resetGame())
  })
)(Menu);
