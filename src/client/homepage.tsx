
import * as React from 'react';
import { Link } from 'react-router-dom';
import { History } from 'history';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faDice } from '@fortawesome/free-solid-svg-icons';

interface IProps {
  history: History;
}

interface IState {
  roomName: string;
}

export default class Homepage extends React.Component<IProps, IState> {
  public constructor(props: IProps) {
    super(props);
    this.state = { roomName: localStorage.getItem('savedRoomName') || '' };
  }

  setRoomName = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ roomName: e.target.value });
  }

  submit = (name = this.state.roomName) => {
    this.props.history.push(`/${name}`);
  }

  buttonPress = () => this.submit();

  inputKeyDown = (e: React.KeyboardEvent) => {
    if (e.keyCode === 13) this.submit();
  }

  randomize = async () => {
    const res = await fetch('/newroom', { method: 'POST' });
    if (res.ok) {
      const roomName = await res.text();
      this.setState({ roomName });
    }
  }

  render() {
    return <div className="homepage">
      <div className="homepage-title">
        {/* TODO: extract this */}
        Uno
      </div>
      <div className="homepage-navigator">
        <div className="row label">
          Room Name
        </div>
        <div className="row">
          <button className="randomize-btn" onClick={this.randomize}>
            <FontAwesomeIcon icon={ faDice } />
          </button>
          <input
            className="homepage-input"
            value={this.state.roomName}
            onChange={this.setRoomName}
            onKeyDown={this.inputKeyDown} />
        </div>
        <div className="row submit">
          <button
            className="primary homepage-go-btn"
            onClick={this.buttonPress}
            disabled={!this.state.roomName}>Play</button>
        </div>
      </div>
    </div>;
  }
}