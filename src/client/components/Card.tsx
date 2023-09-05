import * as React from "react";
import "./Card.scss";

type IProps = {
  color: "red" | "green" | "yellow" | "blue" | "black" | "gray";
  value:
    | "0"
    | "1"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9"
    | "reverse"
    | "skip"
    | "draw2"
    | "draw4"
    | "wild"
    | "back"
    | "empty";
} & React.HTMLAttributes<HTMLDivElement>;

export function Card(props: IProps) {
  const { color, value, className, ...throughProps } = props;
  return (
    <div {...throughProps} className={`card ${className || ""}`}>
      <div className={`card-image val-${value} ${color}`} />
    </div>
  );
}

export default Card;
