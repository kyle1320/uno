import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faAngleLeft } from '@fortawesome/free-solid-svg-icons';

import { UnoSpec, L1, L3, L4, Req } from '..';
import { state, ClientGameActions } from '../../../types';
import FullscreenToggle from './FullscreenToggle';
import GameTimer from './GameTimer';

import './Menu.scss';
import RoomLink from './RoomLink';

type StandingsInfo = {
  name: string;
  score: number;
  gamesWon: number;
  index: number;
  id: string;
}[];
type StandingsProps = {
  standings: StandingsInfo;
  resetScores: () => void;
};
const Standings = connect(
  (state: state.ClientSide<UnoSpec>) => ({
    standings: state.l1.turnOrder
      .map((id, i) => ({
        ...state.l1.players[id],
        index: i
      }))
      .sort((a, b) => b.score - a.score || b.index - a.index)
  }),
  (dispatch: Dispatch<ClientGameActions<UnoSpec>>) => ({
    resetScores: () => dispatch(Req.actions.resetScores())
  })
)(function (props: StandingsProps) {
  return (
    <>
      <div className="section-header">
        <h3>Standings</h3>
        <button className="secondary" onClick={props.resetScores}>
          Reset
        </button>
      </div>
      <table>
        <tbody>
          {props.standings.map(s => (
            <tr className="standing" key={s.id}>
              <th>{s.name}: </th>
              <td>
                {s.score} point{s.score === 1 ? '' : 's'},{' '}
              </td>
              <td>
                {s.gamesWon} game{s.gamesWon === 1 ? '' : 's'} won
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
});

type RulesProps = {
  update: (rules: Partial<L1.state.Rules>) => void;
} & L1.state.Rules;
const Rules = connect(
  (state: state.ClientSide<UnoSpec>) => state.l1.rules,
  (dispatch: Dispatch<ClientGameActions<UnoSpec>>) => ({
    update: (rules: Partial<L1.state.Rules>) =>
      dispatch(Req.actions.updateRules(rules))
  })
)(function (props: RulesProps) {
  return (
    <>
      <div className="section-header">
        <h3>Rules</h3>
      </div>
      <div className="row">
        <label className="row">
          <input
            type="checkbox"
            checked={props.stackDraw2}
            onChange={React.useCallback(
              e => props.update({ stackDraw2: e.target.checked }),
              [props.update]
            )}
          />
          Stack Draw 2s
        </label>
        <label className="row">
          <input
            type="checkbox"
            checked={props.stackDraw2OnDraw4}
            onChange={React.useCallback(
              e => props.update({ stackDraw2OnDraw4: e.target.checked }),
              [props.update]
            )}
          />
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
            )}
          />
          Stack Draw 4s
        </label>
        <label className="row">
          <input
            type="checkbox"
            checked={props.stackDraw4OnDraw2}
            onChange={React.useCallback(
              e => props.update({ stackDraw4OnDraw2: e.target.checked }),
              [props.update]
            )}
          />
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
          )}
        />
        Draw 'Till You Play
      </label>
      <label className="row">
        <input
          type="checkbox"
          checked={props.battleRoyale}
          onChange={React.useCallback(
            e => props.update({ battleRoyale: e.target.checked }),
            [props.update]
          )}
        />
        Battle Royale
      </label>
      <label className="row">
        <input
          type="checkbox"
          checked={props.canJoinMidGame}
          onChange={React.useCallback(
            e => props.update({ canJoinMidGame: e.target.checked }),
            [props.update]
          )}
        />
        Allow Joining Mid-Game
      </label>
      <label className="row">
        Starting Cards:
        <select
          value={props.initialCards}
          onChange={React.useCallback(
            e => props.update({ initialCards: +e.target.value }),
            [props.update]
          )}>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
          <option value="11">11</option>
          <option value="12">12</option>
        </select>
      </label>
      <label className="row">
        Number of Decks:
        <select
          value={props.deckCount}
          onChange={React.useCallback(
            e => props.update({ deckCount: +e.target.value }),
            [props.update]
          )}>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
      </label>
      <label className="row">
        Uno Penalty Cards:
        <select
          value={props.penaltyCardCount}
          onChange={React.useCallback(
            e => props.update({ penaltyCardCount: +e.target.value }),
            [props.update]
          )}>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
        </select>
      </label>
      <label className="row">
        AI Players:
        <select
          value={props.aiCount}
          onChange={React.useCallback(
            e => props.update({ aiCount: +e.target.value }),
            [props.update]
          )}>
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
      </label>
    </>
  );
});

interface IProps {
  name: string;
  sortCards: boolean;
  status: L1.state.GameStatus;
  setSortCards: (sortCards: boolean) => void;
  setName: (name: string) => void;
  resetGame: () => void;
}

export function Menu(props: IProps) {
  const [open, toggle] = React.useReducer(x => !x, false);

  return (
    <div className={`menu-container${open ? ' open' : ''}`} onClick={toggle}>
      <div className="menu" onClick={e => e.stopPropagation()}>
        <div className="menu-icon" onClick={toggle}>
          <div className="line1" />
          <div className="line2" />
          <div className="line3" />
        </div>
        <div className="header">
          <div className="row">
            <Link to="/" className="home-link">
              <FontAwesomeIcon icon={faAngleLeft} />{' '}
              <FontAwesomeIcon icon={faHome} />
            </Link>
            {props.status === L1.state.GameStatus.Started ? (
              <div className="timer">
                <GameTimer />
              </div>
            ) : null}
            <RoomLink shorten />
          </div>
        </div>
        <div className="scrolling">
          <div className="section-header">
            <h3>Options</h3>
          </div>
          <label className="row">
            Name{' '}
            <input
              type="text"
              value={props.name}
              onChange={React.useCallback(e => props.setName(e.target.value), [
                props.setName
              ])}
            />
          </label>
          <label className="row">
            <input
              type="checkbox"
              checked={props.sortCards}
              onChange={React.useCallback(
                e => props.setSortCards(e.target.checked),
                [props.setSortCards]
              )}
            />
            Sort Cards
          </label>
          <Rules />
          <Standings />
        </div>
        <div className="buttons">
          <FullscreenToggle className="secondary" />
          <button
            className="primary"
            onClick={React.useCallback(() => {
              props.resetGame();
              toggle();
            }, [props.resetGame, toggle])}>
            New Game
          </button>
        </div>
      </div>
    </div>
  );
}

export default connect(
  (state: state.ClientSide<UnoSpec>) => ({
    name: state.l3.name,
    sortCards: state.l4.settings.sortCards,
    status: state.l1.status
  }),
  (dispatch: Dispatch<ClientGameActions<UnoSpec>>) => ({
    setName: (name: string) => dispatch(L3.actions.setName(name)),
    setSortCards: (sortCards: boolean) =>
      dispatch(L4.actions.updateSettings({ sortCards })),
    resetGame: () => dispatch(Req.actions.resetGame())
  })
)(Menu);
