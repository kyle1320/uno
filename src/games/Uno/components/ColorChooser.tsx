import * as React from 'react';

import { Color } from '../common';

import './ColorChooser.scss';

interface IProps {
  onSelect: (color: Color) => void;
  onClose: () => void;
}

export default function ColorChooser(props: IProps) {
  return (
    <div className="color-chooser" onClick={props.onClose}>
      <div>Choose a color</div>
      <svg viewBox="-30 -45 60 90">
        <defs>
          <clipPath id="card-ellipse-clip">
            <ellipse
              id="card-ellipse"
              cx="0"
              cy="0"
              rx="19"
              ry="37"
              transform="rotate(33,0,0)"
            />
          </clipPath>
          <filter id="svg-highlight">
            <feDropShadow dx="0" dy="0" stdDeviation="1" flood-color="white" />
          </filter>
        </defs>
        <g id="color-chooser-wheel">
          <g clipPath="url(#card-ellipse-clip)">
            <rect
              width="30"
              height="45"
              x="0"
              y="0"
              transform="matrix(1,0,-.4,1,0,0)"
              style={{ fill: '#00A651' }}
            />
            <rect
              width="30"
              height="45"
              x="0"
              y="-45"
              transform="matrix(1,0,-.4,1,0,0)"
              style={{ fill: '#0096DA' }}
            />
            <rect
              width="30"
              height="45"
              x="-30"
              y="0"
              transform="matrix(1,0,-.4,1,0,0)"
              style={{ fill: '#FFDE00' }}
            />
            <rect
              width="30"
              height="45"
              x="-30"
              y="-45"
              transform="matrix(1,0,-.4,1,0,0)"
              style={{ fill: '#ED1C24' }}
            />

            {/* TODO: use filters for this instead */}
            <rect
              width="30"
              height="45"
              x="0"
              y="0"
              transform="matrix(1,0,-.4,1,0,0)"
              className="color-chooser-color"
              onClick={React.useCallback(e => {
                e.stopPropagation();
                props.onSelect('green');
              }, [])}
            />
            <rect
              width="30"
              height="45"
              x="0"
              y="-45"
              transform="matrix(1,0,-.4,1,0,0)"
              className="color-chooser-color"
              onClick={React.useCallback(e => {
                e.stopPropagation();
                props.onSelect('blue');
              }, [])}
            />
            <rect
              width="30"
              height="45"
              x="-30"
              y="0"
              transform="matrix(1,0,-.4,1,0,0)"
              className="color-chooser-color"
              onClick={React.useCallback(e => {
                e.stopPropagation();
                props.onSelect('yellow');
              }, [])}
            />
            <rect
              width="30"
              height="45"
              x="-30"
              y="-45"
              transform="matrix(1,0,-.4,1,0,0)"
              className="color-chooser-color"
              onClick={React.useCallback(e => {
                e.stopPropagation();
                props.onSelect('red');
              }, [])}
            />
          </g>
          <use
            xlinkHref="#card-ellipse"
            style={{ fill: 'none', stroke: '#ffffff', strokeWidth: '3' }}
          />
        </g>
      </svg>
    </div>
  );
}
