var React = require("react");
var ReactDom = require("react-dom");
var ReactRouter = require("react-router");
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var createHistory = require("history/lib/createBrowserHistory");
var sampleFishes = require("./sample-fishes");

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
