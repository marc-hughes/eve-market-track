import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Routes } from './Routes';

function render() {
  ReactDOM.render(<Routes />, document.querySelector('#react-content'));
}

render();
