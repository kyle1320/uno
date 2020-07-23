import * as React from 'react';
import './Card.scss';

type IProps = {
  color: "red" | "green" | "yellow" | "blue" | "black" | "gray";
  value: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "reverse" | "skip" | "draw2" | "draw4" | "wild" | "back" | "empty";
  turned?: boolean;
} & React.SVGProps<SVGElement>

export function Card(props: IProps) {
  const { color, value, turned, ref, className, ...throughProps } = props;
  const smallEl = "#card-value-small-" + props.value;
  const largeEl = "#card-value-large-" + props.value;
  let cls = `card ${color}${turned ? ' turned' : ''} ${className || ''}`;
  return (
    <svg
      {...throughProps}
      className={cls}
      style={value === 'empty' ? { opacity: 0.5 } : {}}
      viewBox={turned ? "0 0 90 60" : "0 0 60 90"}>
      <g transform={turned ? "rotate(-90, 30, 30)" : ""}>
        <use xlinkHref="#card-body" x="0" y="0" />
        {value === 'empty'
          ? null : <>
          <use xlinkHref="#card-ellipse" x="30" y="45" className="card-ellipse" />,
          <use x="35" y="40" xlinkHref={smallEl} transform="scale(0.3)" />,
          <use x="165" y="260" xlinkHref={smallEl} transform="scale(0.3) rotate(180, 165, 260)" />,
          <use x="30" y="45" xlinkHref={largeEl} />
        </>}
        <use xlinkHref="#card-outline" x="2" y="2" />
      </g>
    </svg>
  );
}

export default Card;

export function CardDefs() {
  return (
    <svg width="0" height="0" viewBox="0 0 0 0">
      <defs>
        <g id="card-outline"><rect width="56" height="86" rx="4" ry="4" /></g>
        <g id="card-body"><rect width="60" height="90" rx="5" ry="5" /></g>
        <clipPath id="card-ellipse-clip">
          <ellipse id="card-ellipse" cx="0" cy="0" rx="19" ry="37" transform="rotate(33,0,0)" />
        </clipPath>
        <g id="card-value-small-0" className="card-small-value"><text transform="translate(-13.5,12.5)">0</text></g>
        <g id="card-value-large-0" className="card-large-value"><text transform="translate(-13.5,12.5)">0</text></g>
        <g id="card-value-small-1" className="card-small-value"><text transform="translate(-13.5,12.5)">1</text></g>
        <g id="card-value-large-1" className="card-large-value"><text transform="translate(-13.5,12.5)">1</text></g>
        <g id="card-value-small-2" className="card-small-value"><text transform="translate(-13.5,12.5)">2</text></g>
        <g id="card-value-large-2" className="card-large-value"><text transform="translate(-13.5,12.5)">2</text></g>
        <g id="card-value-small-3" className="card-small-value"><text transform="translate(-13.5,12.5)">3</text></g>
        <g id="card-value-large-3" className="card-large-value"><text transform="translate(-13.5,12.5)">3</text></g>
        <g id="card-value-small-4" className="card-small-value"><text transform="translate(-13.5,12.5)">4</text></g>
        <g id="card-value-large-4" className="card-large-value"><text transform="translate(-13.5,12.5)">4</text></g>
        <g id="card-value-small-5" className="card-small-value"><text transform="translate(-13.5,12.5)">5</text></g>
        <g id="card-value-large-5" className="card-large-value"><text transform="translate(-13.5,12.5)">5</text></g>
        <g id="card-value-small-6" className="card-small-value"><text transform="translate(-13.5,11.5)" style={{textDecoration:"underline"}}>6</text></g>
        <g id="card-value-large-6" className="card-large-value"><text transform="translate(-13.5,11.5)" style={{textDecoration:"underline"}}>6</text></g>
        <g id="card-value-small-7" className="card-small-value"><text transform="translate(-13.5,12.5)">7</text></g>
        <g id="card-value-large-7" className="card-large-value"><text transform="translate(-13.5,12.5)">7</text></g>
        <g id="card-value-small-8" className="card-small-value"><text transform="translate(-13.5,12.5)">8</text></g>
        <g id="card-value-large-8" className="card-large-value"><text transform="translate(-13.5,12.5)">8</text></g>
        <g id="card-value-small-9" className="card-small-value"><text transform="translate(-13.5,11.5)" style={{textDecoration:"underline"}}>9</text></g>
        <g id="card-value-large-9" className="card-large-value"><text transform="translate(-13.5,11.5)" style={{textDecoration:"underline"}}>9</text></g>
        <g id="card-value-small-reverse" className="card-small-value">
          <path xmlns="http://www.w3.org/2000/svg" d="m 0,-16.25 2.5,2.5 -10,10 c -2.5,2.5 -2.5,7.5 0,10 l 5,-5 10,-10 2.5,2.5 0,-10 z" />
          <path xmlns="http://www.w3.org/2000/svg" d="m 0,16.25 -2.5,-2.5 10,-10 c 2.5,-2.5 2.5,-7.5 0,-10 l -5,5 -10,10 -2.5,-2.5 0,10 z" />
        </g>
        <g id="card-value-large-reverse" className="card-large-value">
          <path xmlns="http://www.w3.org/2000/svg" d="m 0,-16.25 2.5,2.5 -10,10 c -2.5,2.5 -2.5,7.5 0,10 l 5,-5 10,-10 2.5,2.5 0,-10 z" />
          <path xmlns="http://www.w3.org/2000/svg" d="m 0,16.25 -2.5,-2.5 10,-10 c 2.5,-2.5 2.5,-7.5 0,-10 l -5,5 -10,10 -2.5,-2.5 0,10 z" />
        </g>
        <g id="card-value-small-skip" className="card-small-value">
          <path xmlns="http://www.w3.org/2000/svg" d="m 4,-17 c -3.83883,-0.005 -7.69225,1.44991 -10.625,4.375 -5.8655,5.85022 -5.88143,15.35325 -0.0312,21.21875 5.85022,5.8655 15.35325,5.88143 21.21875,0.0312 5.8655,-5.85022 5.88143,-15.35325 0.0312,-21.21875 -2.92511,-2.93275 -6.75492,-4.40124 -10.59375,-4.40625 z m -0.0312,5 c 1.74988,0.002 3.50772,0.46009 5.0625,1.375 l -13.6875,13.6875 c -2.26035,-3.83781 -1.73681,-8.8655 1.5625,-12.15625 1.95517,-1.95007 4.50328,-2.90958 7.0625,-2.90625 z m 8.625,4.90625 c 2.27597,3.84073 1.74339,8.8902 -1.5625,12.1875 -3.3027,3.29409 -8.32289,3.77828 -12.15625,1.5 l 13.71875,-13.6875 z" />
        </g>
        <g id="card-value-large-skip" className="card-large-value">
          <path xmlns="http://www.w3.org/2000/svg" d="m 0,-15 c -3.83883,-0.005 -7.69225,1.44991 -10.625,4.375 -5.8655,5.85022 -5.88143,15.35325 -0.0312,21.21875 5.85022,5.8655 15.35325,5.88143 21.21875,0.0312 5.8655,-5.85022 5.88143,-15.35325 0.0312,-21.21875 -2.92511,-2.93275 -6.75492,-4.40124 -10.59375,-4.40625 z m -0.0312,5 c 1.74988,0.002 3.50772,0.46009 5.0625,1.375 l -13.6875,13.6875 c -2.26035,-3.83781 -1.73681,-8.8655 1.5625,-12.15625 1.95517,-1.95007 4.50328,-2.90958 7.0625,-2.90625 z m 8.625,4.90625 c 2.27597,3.84073 1.74339,8.8902 -1.5625,12.1875 -3.3027,3.29409 -8.32289,3.77828 -12.15625,1.5 l 13.71875,-13.6875 z" />
        </g>

        <g id="draw-card">
          <rect width="16" height="26" rx="2" ry="2" x="0" y="0" transform="matrix(1,0,-.4,1,0,0)" style={{ fill: '#ffffff' }} />
          <rect width="12" height="22" rx="1" ry="1" x="2" y="2" transform="matrix(1,0,-.4,1,0,0)" style={{ stroke: 'none' }} />
        </g>
        <g id="card-value-small-draw2" className="card-small-value"><text transform="translate(-13.5,12.5)">+2</text></g>
        <g id="card-value-large-draw2" className="card-large-value">
          <use xlinkHref="#draw-card" x="3" y="-20" />
          <use xlinkHref="#draw-card" x="-11" y="-5" />
        </g>
        <g id="card-value-small-draw4" className="card-small-value"><text transform="translate(-13.5,12.5)">+4</text></g>
        <g id="card-value-large-draw4" className="card-large-value">
          <use xlinkHref="#draw-card" x="-6" y="-4" transform="scale(0.8)" style={{ fill: "#FFDE00" }} />
          <use xlinkHref="#draw-card" x="7" y="-15" transform="scale(0.8)" style={{ fill: "#00A651" }} />
          <use xlinkHref="#draw-card" x="-2" y="-24" transform="scale(0.8)" style={{ fill: "#0096DA" }} />
          <use xlinkHref="#draw-card" x="-14" y="-12" transform="scale(0.8)" style={{ fill: "#ED1C24" }} />
        </g>

        <g id="card-value-wild" className="card-value-wild">
          <g clipPath="url(#card-ellipse-clip)">
            <rect width="30" height="45" x="0" y="0" transform="matrix(1,0,-.4,1,0,0)" style={{ fill: "#00A651" }}/>
            <rect width="30" height="45" x="0" y="-45" transform="matrix(1,0,-.4,1,0,0)" style={{ fill: "#0096DA" }}/>
            <rect width="30" height="45" x="-30" y="0" transform="matrix(1,0,-.4,1,0,0)" style={{ fill: "#FFDE00" }}/>
            <rect width="30" height="45" x="-30" y="-45" transform="matrix(1,0,-.4,1,0,0)" style={{ fill: "#ED1C24" }}/>
          </g>
          <use xlinkHref="#card-ellipse" style={{ fill: 'none', stroke: '#ffffff', strokeWidth: '3'}} />
        </g>
        <g id="card-value-small-wild" className="card-small-value card-value-wild" transform="scale(0.6) translate(10, 4)">
          <use xlinkHref="#card-value-wild" style={{ fill: 'none', stroke: '#ffffff', strokeWidth: '3'}} />
        </g>
        <g id="card-value-large-wild" className="card-large-value card-value-wild">
          <use xlinkHref="#card-value-wild" style={{ fill: 'none', stroke: '#ffffff', strokeWidth: '3'}} />
        </g>

        <g id="card-value-large-back" className="card-value-wild">
          <use xlinkHref="#card-ellipse" style={{ fill: '#ED1C24', stroke: '#ED1C24', strokeWidth: "2" }} />
        </g>

        <filter id="shadow">
          <feDropShadow dx="0.8" dy="0.8" stdDeviation="0"/>
        </filter>
        <filter id="darken">
          <feColorMatrix values="0.6 0 0 0 0 0 0.6 0 0 0 0 0 0.6 0 0 0 0 0 1 0"/>
        </filter>
      </defs>
    </svg>
  );
}