import React from 'react';

type MyProps = any;
type MyState = { error: boolean };

export class IgnoreError extends React.PureComponent<MyProps, MyState> {
  constructor(props: any) {
    super(props);
    this.state = { error: false };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('Ignoring error', error);
    this.setState({ error: true });
  }

  render() {
    if (this.state.error) return null;
    return this.props.children;
  }
}
