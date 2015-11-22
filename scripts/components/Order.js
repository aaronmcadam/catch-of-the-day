import React from "react";
import CssTransitionGroup from "react-addons-css-transition-group";
import h from "../helpers";

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

export default Order;
