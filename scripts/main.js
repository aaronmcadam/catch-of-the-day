var React = require("react");
var ReactDom = require("react-dom");
var ReactRouter = require("react-router");
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var Navigation = ReactRouter.Navigation;
var History = ReactRouter.History;
var createHistory = require("history/lib/createBrowserHistory");
var Rebase = require("re-base");
var Catalyst = require("react-catalyst");
var h = require("./helpers");
var sampleFishes = require("./sample-fishes");

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
        <Order fishes={this.state.fishes} order={this.state.order} />
        <Inventory
          addFish={this.addFish}
          loadSamples={this.loadSamples}
          fishes={this.state.fishes}
          linkState={this.linkState}
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

  loadSamples: function() {
    this.setState({
      fishes: sampleFishes
    });
  },

  addToOrder: function(key) {
    this.state.order[key] = this.state.order[key] + 1 || 1;
    this.setState({ order: this.state.order });
  }
});

var Fish = React.createClass({
  render: function() {
    var details = this.props.details;
    var isAvailable = details.status === "available" ? true: false;
    var isSoldOut = !isAvailable;
    var buttonText = isAvailable ? "Add To Order" : "Sold Out";

    return (
      <li className="menu-fish">
        <img src={details.image} alt={details.name} />
        <h3 className="fish-name">
          {details.name}
          <span className="price">{h.formatPrice(details.price)}</span>
        </h3>
        <p>{details.desc}</p>
        <button disabled={isSoldOut} onClick={this.addToOrder}>
          {buttonText}
        </button>
      </li>
    );
  },

  addToOrder: function() {
    var key = this.props.index;
    this.props.addToOrder(key);
  }
});

var AddFishForm = React.createClass({
  render: function() {
    return (
      <form className="fish-edit" ref="fishForm" onSubmit={this.createFish}>
        <input type="text" ref="name" placeholder="Fish Name"/>
        <input type="text" ref="price" placeholder="Fish Price" />
        <select ref="status">
          <option value="available">Fresh!</option>
          <option value="unavailable">Sold Out!</option>
        </select>
        <textarea type="text" ref="desc" placeholder="Desc"></textarea>
        <input type="text" ref="image" placeholder="URL to Image" />
        <button type="submit">+ Add Item</button>
      </form>
    );
  },

  createFish: function(event) {
    event.preventDefault();
    var fish = {
      name: this.refs.name.value,
      price: this.refs.price.value,
      status: this.refs.status.value,
      desc: this.refs.desc.value,
      image: this.refs.image.value
    };
    this.props.addFish(fish);
    this.refs.fishForm.reset();
  }
});

var Header = React.createClass({
  render: function() {
    return (
      <header className="top">
        <h1>Catch
          <span className="ofThe">
          <span className="of">of</span>
          <span className="the">the</span>
          </span>
          Day</h1>
        <h3 className="tagline"><span>{this.props.tagline}</span></h3>
      </header>
    );
  }
});

var Order = React.createClass({
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
        <ul className="order">
          {orderIds.map(this.renderOrder)}
          <li className="total">
            <strong>Total:</strong>
            {h.formatPrice(total)}
          </li>
        </ul>
      </div>
    );
  },

  renderOrder: function(orderId) {
    var fish = this.props.fishes[orderId];

    if (!fish) {
      return <li key={orderId}>Sorry, fish no longer available!</li>
    }

    var count = this.props.order[orderId];
    var fish_name = fish.name;
    var subtotal = count * fish.price;
    subtotal = h.formatPrice(subtotal);

    return (
      <li key={orderId}>
        <span>{count}</span>lbs
        {fish_name}
        <span className="price">{subtotal}</span>
      </li>
    );
  }
});

var Inventory = React.createClass({
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
    var linkState = this.props.linkState;
    var keys = this.keysFor(fishId);

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
        <button>Remove Fish</button>
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

var StorePicker = React.createClass({
  mixins: [History],

  render: function() {
    return (
      <form className="store-selector" onSubmit={this.goToStore}>
        <h2>Please Enter A Store</h2>
        <input
          type="text"
          ref="storeId"
          defaultValue={h.getFunName()}
          required
        />
        <input type="submit" />
      </form>
    );
  },

  goToStore: function(event) {
    event.preventDefault();
    var storeId = this.refs.storeId.value;
    this.history.pushState(null, "/store/" + storeId);
  }
});

var NotFound = React.createClass({
  render: function() {
    return <h1>Not Found!</h1>
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
