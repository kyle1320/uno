import * as React from "react";
import { Fireworks } from "fireworks-js";

import "./Fireworks.scss";

interface IProps {
  show: boolean;
}

interface IState {
  fireworks: Fireworks | null;
  timeout: NodeJS.Timeout | null;
}

export default class FireworksComponent extends React.PureComponent<IProps, IState> {
  private ref = React.createRef<HTMLDivElement>();

  public constructor(props: IProps) {
    super(props);
    this.state = {
      fireworks: null,
      timeout: null
    };
  }

  componentDidMount() {
    if (this.props.show) {
      this.start();
    }
  }

  componentDidUpdate(prevProps: IProps) {
    if (this.props.show && !prevProps.show) {
      this.start();
    }
  }

  private stop() {
    if (!this.state.fireworks) return;

    this.state.fireworks.waitStop(true).then(() => {
      this.setState({ fireworks: null });
      if (this.ref.current) {
        while (this.ref.current.firstChild) {
          this.ref.current.removeChild(this.ref.current.firstChild);
        }
      }
    });
    this.setState({ timeout: null });
  }

  private start() {
    if (this.ref.current) {
      if (this.state.timeout) {
        clearTimeout(this.state.timeout);
      }

      const fireworks = new Fireworks(this.ref.current, {
        acceleration: 1,
        flickering: 0,
        delay: { min: 15, max: 25 },
        rocketsPoint: { min: 0, max: 100 }
      });
      this.setState({
        fireworks,
        timeout: setTimeout(() => this.stop(), 1200)
      });
      fireworks.start();
    }
  }

  render() {
    return <div className="fireworks-container" ref={this.ref} />;
  }
}
