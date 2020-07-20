
import * as React from 'react';
import { Link } from 'react-router-dom';
import { History } from 'history';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

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

  submit = () => {
    window.location.href = this.state.roomName;
  }

  inputKeyDown = (e: React.KeyboardEvent) => {
    if (e.keyCode === 13) {
      this.props.history.push(`/${this.state.roomName}`);
    }
  }

  render() {
    return <div className="homepage">
      <div className="homepage-title">
        {/* TODO: extract this */}
        Uno
      </div>
      <div className="homepage-navigator">
        <input
          className="homepage-input"
          placeholder="Room Name"
          value={this.state.roomName}
          onChange={this.setRoomName}
          onKeyDown={this.inputKeyDown} />
        <Link
          className="homepage-go-btn"
          to={`/${this.state.roomName}`}>
          <FontAwesomeIcon icon={ faArrowRight } />
        </Link>
      </div>
    </div>;
  }
}