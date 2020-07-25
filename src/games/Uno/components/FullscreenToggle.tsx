import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExpand, faCompress } from '@fortawesome/free-solid-svg-icons';

import './FullscreenToggle.scss';

interface IProps {
  className?: string;
}

export default class FullscreenToggle extends React.PureComponent<IProps> {
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
    let className = "fullscreen-toggle";
    if (this.props.className) {
      className += ' ' + this.props.className;
    }
    return <button className={className} onClick={this.toggle}>
      {document.fullscreenElement
        ? <FontAwesomeIcon icon={faCompress} />
        : <FontAwesomeIcon icon={faExpand} />}
      {document.fullscreenElement ? 'Exit Fullscreen' : 'Enter Fullscreen'}
    </button>;
  }
}
