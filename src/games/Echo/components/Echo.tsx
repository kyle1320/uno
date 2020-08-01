import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { state, ClientGameActions } from '../../../types';
import { EchoSpec, L3, Req } from '..';

interface Props {
  message: string;
  messages: string[];
  setMessage: (msg: string) => void;
  send: () => void;
}

class Echo extends React.PureComponent<Props> {
  updateMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.setMessage(e.target.value);
  };

  submit = () => {
    this.props.send();
  };

  render() {
    return (
      <div>
        <ul>
          {this.props.messages.map((msg, i) => (
            <li key={i}>{msg}</li>
          ))}
        </ul>
        <div>
          <input value={this.props.message} onChange={this.updateMessage} />
          <button onClick={this.submit}>Send</button>
        </div>
      </div>
    );
  }
}

export default connect(
  (state: state.ClientSide<EchoSpec>) => ({
    messages: state.l1.messages,
    message: state.l3.message
  }),
  (dispatch: Dispatch<ClientGameActions<EchoSpec>>) => ({
    setMessage: (msg: string) => dispatch(L3.actions.type(msg)),
    send: () => dispatch(Req.actions.send())
  })
)(Echo);
