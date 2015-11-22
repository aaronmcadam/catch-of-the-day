import React from "react";
import Catalyst from "react-catalyst";
import Rebase from "re-base";
import Header from "./Header";
import Order from "./Order";
import Inventory from "./Inventory";
import Fish from "./Fish";

var rebaseUrl = "https://az-catch-of-the-day.firebaseio.com/";
var database = Rebase.createClass(rebaseUrl);

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

export default App;
