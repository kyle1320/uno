import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExpand, faCompress } from '@fortawesome/free-solid-svg-icons';

import './FullscreenToggle.scss';

export default class FullscreenToggle extends React.PureComponent {
  componentDidMount() {
    document.addEventListener('fullscreenchange', this.update);
  }

  componentWillUnmount() {
    document.removeEventListener('fullscreenchange', this.update);
  }

  update = () => this.forceUpdate();
  toggle = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.getElementById('root')?.requestFullscreen();
    }
  }

  render() {
    return <button className="fullscreen-toggle" onClick={this.toggle}>
      {document.fullscreenElement
        ? <FontAwesomeIcon icon={faCompress} />
        : <FontAwesomeIcon icon={faExpand} />}
      {document.fullscreenElement ? 'Exit Fullscreen' : 'Enter Fullscreen'}
    </button>;
  }
}
