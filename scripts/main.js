var React = require("react");
var ReactDom = require("react-dom");
var CssTransitionGroup = require("react-addons-css-transition-group");
var ReactRouter = require("react-router");
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var createHistory = require("history/lib/createBrowserHistory");
var Rebase = require("re-base");
var Catalyst = require("react-catalyst");
var h = require("./helpers");
var sampleFishes = require("./sample-fishes");

var rebaseUrl = "https://az-catch-of-the-day.firebaseio.com/";
var database = Rebase.createClass(rebaseUrl);

import NotFound from "./components/NotFound";
import StorePicker from "./components/StorePicker";
import Header from "./components/Header";
import Fish from "./components/Fish";
import AddFishForm from "./components/AddFishForm";

var App = React.createClass({
  mixins: [Catalyst.LinkedStateMixin],

  componentDidMount: function() {
    var path = this.props.params.storeId + "/fishes";
    var payload = { context: this, state: "fishes" };
    database.syncState(path, payload);

    var key = "order-" + this.props.params.storeId;
    var localStorageRef = window.localStorage.getItem(key);
    if (localStorageRef) {
      this.setState({
        order: window.JSON.parse(localStorageRef)
      });
    }
  },

  componentWillUpdate: function(nextProps, nextState) {
    var key = "order-" + this.props.params.storeId;
    var value = window.JSON.stringify(nextState.order);
    window.localStorage.setItem(key, value);
  },

  render: function() {
    var fishes = Object.keys(this.state.fishes)

    return (
      <div className="catch-of-the-day">
        <div className="menu">
          <Header tagline="Fresh Seafood Market" />
          <ul className="list-of-fishes">
            {fishes.map(this.renderFish)}
          </ul>
        </div>
        <Order
          fishes={this.state.fishes}
          order={this.state.order}
          removeFromOrder={this.removeFromOrder}
        />
        <Inventory
          addFish={this.addFish}
          loadSamples={this.loadSamples}
          fishes={this.state.fishes}
          linkState={this.linkState}
          removeFish={this.removeFish}
        />
      </div>
    );
  },

  renderFish: function(key) {
    var fish = this.state.fishes[key];

    return (
      <Fish
        key={key}
        index={key}
        details={fish}
        addToOrder={this.addToOrder}
      />
    );
  },

  getInitialState: function() {
    return {
      fishes: {},
      order: {}
    };
  },

  addFish: function(fish) {
    var timestamp = new Date().getTime();
    this.state.fishes["fish-" + timestamp] = fish;
    this.setState({ fishes: this.state.fishes });
  },

  removeFish: function(key) {
    if (!confirm("Are you sure you want to remove this fish?")) {
      return;
    }

    this.state.fishes[key] = null;
    this.setState({ fishes: this.state.fishes });
  },

  loadSamples: function() {
    this.setState({
      fishes: sampleFishes
    });
  },

  addToOrder: function(key) {
    this.state.order[key] = this.state.order[key] + 1 || 1;
    this.setState({ order: this.state.order });
  },

  removeFromOrder: function(key) {
    delete this.state.order[key];
    this.setState({ order: this.state.order });
  }
});

var Order = React.createClass({
  propTypes: {
    fishes: React.PropTypes.object.isRequired,
    order: React.PropTypes.object.isRequired,
    removeFromOrder: React.PropTypes.func.isRequired
  },

  render: function() {
    var orderIds = Object.keys(this.props.order);
    var total = orderIds.reduce((prevTotal, orderId)=> {
      var fish = this.props.fishes[orderId];
      var count = this.props.order[orderId];
      var isAvailable = fish && fish.status === "available";

      if (fish && isAvailable) {
        return prevTotal + (count * window.parseInt(fish.price) || 0);
      }

      return prevTotal;
    }, 0);

    return (
      <div className="order-wrap">
        <h2 className="order-title">Your Order</h2>
        <CssTransitionGroup
          className="order"
          component="ul"
          transitionName="order"
          transitionEnterTimeout={500}
          transitionLeaveTimeout={500}
         >
          {orderIds.map(this.renderOrder)}
          <li className="total">
            <strong>Total:</strong>
            {h.formatPrice(total)}
          </li>
        </CssTransitionGroup>
      </div>
    );
  },

  renderOrder: function(orderId) {
    var fish = this.props.fishes[orderId];
    var removeFromOrder = this.props.removeFromOrder.bind(null, orderId)
    var removeButton = <button onClick={removeFromOrder}>&times;</button>

    if (!fish) {
      return (
        <li key={orderId}>Sorry, fish no longer available! {removeButton}</li>
      )
    }

    var count = this.props.order[orderId];
    var fish_name = fish.name;
    var subtotal = count * fish.price;
    subtotal = h.formatPrice(subtotal);

    return (
      <li key={orderId}>
        <span>
        <CssTransitionGroup
          component="span"
          transitionName="count"
          transitionEnterTimeout={250}
          transitionLeaveTimeout={250}
          className="count"
        >
          <span key={count}>{count}</span>
        </CssTransitionGroup>
        lbs {fish_name} {removeButton}
        </span>
        <span className="price">{subtotal}</span>
      </li>
    );
  }
});

var Inventory = React.createClass({
  propTypes: {
    addFish: React.PropTypes.func.isRequired,
    loadSamples: React.PropTypes.func.isRequired,
    fishes: React.PropTypes.object.isRequired,
    linkState: React.PropTypes.func.isRequired,
    removeFish: React.PropTypes.func.isRequired
  },

  render: function() {
    var fishes = Object.keys(this.props.fishes);

    return (
      <div>
        <h2>Inventory</h2>
        {fishes.map(this.renderInventory)}
        <AddFishForm {...this.props} />
        <button onClick={this.props.loadSamples}>Load Sample Fishes</button>
      </div>
    );
  },

  renderInventory: function(fishId) {
    var keys = this.keysFor(fishId);
    var linkState = this.props.linkState;
    var removeFish = this.props.removeFish.bind(null, fishId)

    return (
      <div className="fish-edit" key={fishId}>
        <input type="text" valueLink={linkState(keys.name)} />
        <input type="text" valueLink={linkState(keys.price)} />
        <select valueLink={linkState(keys.status)}>
          <option value="available">Fresh!</option>
          <option value="unavailable">Sold Out!</option>
        </select>
        <textarea valueLink={linkState(keys.desc)}></textarea>
        <input type="text" valueLink={linkState(keys.image)} />
        <button onClick={removeFish}>Remove Fish</button>
      </div>
    );
  },

  keysFor: function(fishId) {
    var keyBase = "fishes." + fishId + ".";

    return {
      name: keyBase + "name",
      price: keyBase + "price",
      status: keyBase + "status",
      desc: keyBase + "desc",
      image: keyBase + "image"
    }
  }
});

var routes = (
  <Router history={createHistory()}>
    <Route path="/" component={StorePicker} />
    <Route path="/store/:storeId" component={App} />
    <Route path="*" component={NotFound} />
  </Router>
);

ReactDom.render(routes, document.querySelector("#main"));
