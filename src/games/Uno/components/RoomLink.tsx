import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardCheck,
  faClipboard
} from '@fortawesome/free-solid-svg-icons';

import './RoomLink.scss';

interface IProps {
  shorten?: boolean;
  onCopy?: () => void;
}

function getRoomName() {
  return location.pathname.substring(1);
}

function getRoomLink() {
  return `${location.protocol}//${location.hostname}${location.pathname}`;
}

function copyRoomLink() {
  navigator.clipboard.writeText(getRoomLink());
}

export default function (props: IProps) {
  const [copied, setCopied] = React.useState(false);
  const copy = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();

      copyRoomLink();
      setCopied(true);
      props.onCopy?.();
    },
    [setCopied]
  );
  return (
    <a
      className="room-link"
      href={getRoomLink()}
      onClick={copy}
      title="Copy Link">
      <div className="room-link-content">
        {props.shorten ? getRoomName() : getRoomLink()}
      </div>
      <FontAwesomeIcon icon={copied ? faClipboardCheck : faClipboard} />
    </a>
  );
}
