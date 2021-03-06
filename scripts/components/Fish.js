import React from "react";
import h from "../helpers";

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

export default Fish;
