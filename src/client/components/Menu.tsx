import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Link } from "react-router-dom";
import { ClientAppAction, ClientStoreState } from "redux-mc/util";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faAngleLeft, faRandom } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

import * as Uno from "../../spec";
import FullscreenToggle from "./FullscreenToggle";
import GameTimer from "./GameTimer";
import RoomLink from "./RoomLink";

import "./Menu.scss";

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
  (state: ClientStoreState<Uno.Spec>) => ({
    standings: state.L1.turnOrder
      .map((id, i) => ({
        id,
        name: state.L1.players[id].name,
        ...(state.L1.scores[id] || { score: 0, gamesWon: 0 }),
        index: i
      }))
      .sort((a, b) => b.score - a.score || b.gamesWon - a.gamesWon || a.index - b.index)
  }),
  (dispatch: Dispatch<ClientAppAction<Uno.Spec>>) => ({
    resetScores: () => dispatch(Uno.Req.actions.resetScores())
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
          {props.standings.map((s) => (
            <tr className="standing" key={s.id}>
              <th>{s.name}: </th>
              <td>
                {s.score} point{s.score === 1 ? "" : "s"},{" "}
              </td>
              <td>
                {s.gamesWon} game{s.gamesWon === 1 ? "" : "s"} won
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
});

type RulesProps = {
  update: (rules: Partial<Uno.L1.Rules>) => void;
} & Uno.L1.Rules;
const Rules = connect(
  (state: ClientStoreState<Uno.Spec>) => state.L1.rules,
  (dispatch: Dispatch<ClientAppAction<Uno.Spec>>) => ({
    update: (rules: Partial<Uno.L1.Rules>) => dispatch(Uno.Req.actions.updateRules(rules))
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
            onChange={(e) => props.update({ stackDraw2: e.target.checked })}
          />
          Stack Draw 2s
        </label>
        <label className="row">
          <input
            type="checkbox"
            checked={props.stackDraw2OnDraw4}
            onChange={(e) => props.update({ stackDraw2OnDraw4: e.target.checked })}
          />
          on Draw 4s
        </label>
      </div>
      <div className="row">
        <label className="row">
          <input
            type="checkbox"
            checked={props.stackDraw4}
            onChange={(e) => props.update({ stackDraw4: e.target.checked })}
          />
          Stack Draw 4s
        </label>
        <label className="row">
          <input
            type="checkbox"
            checked={props.stackDraw4OnDraw2}
            onChange={(e) => props.update({ stackDraw4OnDraw2: e.target.checked })}
          />
          on Draw 2s
        </label>
      </div>
      <label className="row">
        <input
          type="checkbox"
          checked={props.drawTillYouPlay}
          onChange={(e) => props.update({ drawTillYouPlay: e.target.checked })}
        />
        Draw 'Till You Play
      </label>
      <label className="row">
        <input type="checkbox" checked={props.jumpIn} onChange={(e) => props.update({ jumpIn: e.target.checked })} />
        Jump-In
      </label>
      <label className="row">
        <input
          type="checkbox"
          checked={props.battleRoyale}
          onChange={(e) => props.update({ battleRoyale: e.target.checked })}
        />
        Battle Royale
      </label>
      <label className="row">
        <input
          type="checkbox"
          checked={props.lobbyMode}
          onChange={(e) => props.update({ lobbyMode: e.target.checked })}
        />
        Lobby Mode
      </label>
      <label className="row">
        Starting Cards:
        <select value={props.initialCards} onChange={(e) => props.update({ initialCards: +e.target.value })}>
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
        <select value={props.deckCount} onChange={(e) => props.update({ deckCount: +e.target.value })}>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
      </label>
      <label className="row">
        Uno Penalty Cards:
        <select value={props.penaltyCardCount} onChange={(e) => props.update({ penaltyCardCount: +e.target.value })}>
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
        <select value={props.aiCount} onChange={(e) => props.update({ aiCount: +e.target.value })}>
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
  status: Uno.L1.GameStatus;
  canShufflePlayers: boolean;
  setSortCards: (sortCards: boolean) => void;
  setName: (name: string) => void;
  resetGame: (shuffle?: boolean) => void;
}

export function Menu(props: IProps) {
  const [open, toggle] = React.useReducer((x) => !x, false);

  return (
    <div className={`menu-container${open ? " open" : ""}`} onClick={toggle}>
      <div className="menu" onClick={(e) => e.stopPropagation()}>
        <div className="menu-icon" onClick={toggle}>
          <div className="line1" />
          <div className="line2" />
          <div className="line3" />
        </div>
        <div className="header">
          <div className="row">
            <Link to="/" className="home-link">
              <FontAwesomeIcon icon={faAngleLeft} /> <FontAwesomeIcon icon={faHome} />
            </Link>
            {props.status === Uno.L1.GameStatus.Started ? (
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
            Name <input type="text" value={props.name} onChange={(e) => props.setName(e.target.value)} />
          </label>
          <label className="row">
            <input type="checkbox" checked={props.sortCards} onChange={(e) => props.setSortCards(e.target.checked)} />
            Sort Cards
          </label>
          <Rules />
          <Standings />
          <div className="links">
            <a href="https://github.com/kyle1320/uno" target="_blank">
              View on GitHub&nbsp;&nbsp;
              <FontAwesomeIcon icon={faGithub} />
            </a>
          </div>
        </div>
        <div className="buttons">
          <FullscreenToggle className="secondary" />
          <div className="split-button">
            <button
              className="primary"
              onClick={React.useCallback(() => {
                props.resetGame();
                toggle();
              }, [props.resetGame, toggle])}
            >
              New Game
            </button>
            <button
              className="secondary"
              style={{ minWidth: "3em" }}
              disabled={!props.canShufflePlayers}
              onClick={React.useCallback(() => {
                props.resetGame(true);
                toggle();
              }, [props.resetGame, toggle])}
            >
              <FontAwesomeIcon icon={faRandom} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default connect(
  (state: ClientStoreState<Uno.Spec>) => ({
    name: state.L3.name,
    sortCards: state.L4.settings.sortCards,
    status: state.L1.status,
    canShufflePlayers: Uno.clientSelectors.canShufflePlayers(state)
  }),
  (dispatch: Dispatch<ClientAppAction<Uno.Spec>>) => ({
    setName: (name: string) => dispatch(Uno.L3.actions.setName(name)),
    setSortCards: (sortCards: boolean) => dispatch(Uno.L4.actions.updateSettings({ sortCards })),
    resetGame: (shufflePlayers = false) => dispatch(Uno.Req.actions.resetGame({ shufflePlayers }))
  })
)(Menu);
