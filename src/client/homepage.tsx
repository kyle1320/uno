
import * as React from 'react';
import { render } from 'react-dom';

interface State {
  roomName: string;
}

class Homepage extends React.Component<{}, State> {
  public constructor(props: {}) {
    super(props);
    this.state = { roomName: localStorage.getItem('savedRoomName') || '' };
  }

  setRoomName = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ roomName: e.target.value });
  }

  submit = () => {
    window.location.href = this.state.roomName;
  }

  render() {
    return <div>
      <div>Play UNO</div>
      <div>
        <input
          placeholder="Room Name"
          value={this.state.roomName}
          onChange={this.setRoomName} />
        <button onClick={this.submit}>Go</button>
      </div>
    </div>;
  }
}

render(<Homepage />, document.getElementById('root'));