import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { UnoSpec, L1, L3, L4, Req } from '..';
import { state, ClientGameActions } from '../../../types';
import FullscreenToggle from './FullscreenToggle';

import './Menu.scss';

type RulesProps = {
  update: (rules: Partial<L1.state.Rules>) => void;
} & L1.state.Rules;

const Rules = connect(
  (state: state.ClientSide<UnoSpec>) => state.l1.rules,
  (dispatch: Dispatch<ClientGameActions<UnoSpec>>) => ({
    update: (rules: Partial<L1.state.Rules>) => dispatch(Req.actions.updateRules(rules))
  })
)(function (props: RulesProps) {
  return <>
    <div className="row">
      <label className="row">
        <input
          type="checkbox"
          checked={props.stackDraw2}
          onChange={React.useCallback(
            e => props.update({ stackDraw2: e.target.checked }),
            [props.update]
          )} />
        Stack Draw 2s
      </label>
      <label className="row">
        <input
          type="checkbox"
          checked={props.stackDraw2OnDraw4}
          onChange={React.useCallback(
            e => props.update({ stackDraw2OnDraw4: e.target.checked }),
            [props.update]
          )} />
          on Draw 4s
      </label>
    </div>
    <div className="row">
      <label className="row">
        <input
          type="checkbox"
          checked={props.stackDraw4}
          onChange={React.useCallback(
            e => props.update({ stackDraw4: e.target.checked }),
            [props.update]
          )} />
        Stack Draw 4s
      </label>
      <label className="row">
        <input
          type="checkbox"
          checked={props.stackDraw4OnDraw2}
          onChange={React.useCallback(
            e => props.update({ stackDraw4OnDraw2: e.target.checked }),
            [props.update]
          )} />
        on Draw 2s
      </label>
    </div>
    <label className="row">
      <input
        type="checkbox"
        checked={props.drawTillYouPlay}
        onChange={React.useCallback(
          e => props.update({ drawTillYouPlay: e.target.checked }),
          [props.update]
        )} />
        Draw 'Till You Play
    </label>
    <label className="row">
      <input
        type="checkbox"
        checked={props.battleRoyale}
        onChange={React.useCallback(
          e => props.update({ battleRoyale: e.target.checked }),
          [props.update]
        )} />
        Battle Royale
    </label>
    <label className="row">
      Uno Penalty Cards:
      <input
        type="number"
        value={props.penaltyCardCount}
        onChange={React.useCallback(
          e => props.update({ penaltyCardCount: +e.target.value }),
          [props.update]
        )} />
    </label>
  </>;
});

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
      <hr />
      <Rules />
      <div className="spacer" />
      <FullscreenToggle />
      <button className="primary" onClick={React.useCallback(() => {
        props.resetGame();
        toggle();
      }, [props.resetGame, toggle])}>New Game</button>
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
