import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { UnoSpec, L3, Req, L4 } from '..';
import { state, ClientGameActions } from '../../../types';
import FullscreenToggle from './FullscreenToggle';

import './Menu.scss';

interface IProps {
  name: string;
  sortCards: boolean;
  setSortCards: (sortCards: boolean) => void;
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
      <label className="row">
        Name <input
          type="text"
          value={props.name}
          onChange={React.useCallback(
            e => props.setName(e.target.value),
            [props.setName]
          )} />
      </label>
      <hr />
      <label className="row">
        <input
          type="checkbox"
          checked={props.sortCards}
          onChange={React.useCallback(
            e => props.setSortCards(e.target.checked),
            [props.setSortCards]
          )} />
        Sort Cards
      </label>
      <div className="spacer" />
      <FullscreenToggle />
      <button className="primary" onClick={props.resetGame}>New Game</button>
    </div>
  </div>;
}

export default connect(
  (state: state.ClientSide<UnoSpec>) => ({
    name: state.l3.name,
    sortCards: state.l4.sortCards
  }),
  (dispatch: Dispatch<ClientGameActions<UnoSpec>>) => ({
    setName: (name: string) => dispatch(L3.actions.setName(name)),
    setSortCards: (sortCards: boolean) => dispatch(L4.actions.update({ sortCards })),
    resetGame: () => dispatch(Req.actions.resetGame())
  })
)(Menu);
