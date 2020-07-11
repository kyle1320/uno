import * as React from 'react';
import './CardWheel.scss';

type IProps = React.PropsWithChildren<{

}>

function CardWheel(props: IProps) {
  return <div className="card-wheel">
    <div className="card-wheel-container">{
      props.children
    }</div>
  </div>;
}

export default CardWheel;
