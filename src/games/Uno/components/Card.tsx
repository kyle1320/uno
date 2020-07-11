import * as React from 'react';
import './Card.scss';

type IProps = {
  color: "red" | "green" | "yellow" | "blue" | "black";
  value: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "reverse" | "skip" | "draw2" | "draw4" | "wild" | "back";
} & Pick<React.SVGProps<SVGElement>, "onClick">

function Card(props: IProps) {
  const smallEl = "#card-value-small-" + props.value;
  const largeEl = "#card-value-large-" + props.value;
  return (
    <svg onClick={props.onClick} className={`card ${props.color}`} viewBox="0 0 60 90">
      <use xlinkHref="#card-body" x="0" y="0" />
      <use xlinkHref="#card-ellipse" x="30" y="45" className="card-ellipse" />
      <use x="35" y="40" xlinkHref={smallEl} transform="scale(0.3)" />
      <use x="165" y="260" xlinkHref={smallEl} transform="scale(0.3) rotate(180, 165, 260)" />
      <use x="30" y="45" xlinkHref={largeEl} />
      <use xlinkHref="#card-outline" x="2" y="2" />
    </svg>
  );
}



export default Card;
