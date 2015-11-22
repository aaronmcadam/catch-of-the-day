import React from "react";
import ReactDom from "react-dom";
import {Router, Route} from "react-router";
import { createHistory } from "history";

import NotFound from "./components/NotFound";
import StorePicker from "./components/StorePicker";
import App from "./components/App";

var routes = (
  <Router history={createHistory()}>
    <Route path="/" component={StorePicker} />
    <Route path="/store/:storeId" component={App} />
    <Route path="*" component={NotFound} />
  </Router>
);

ReactDom.render(routes, document.querySelector("#main"));
