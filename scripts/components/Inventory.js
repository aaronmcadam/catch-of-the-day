import React from "react";
import AddFishForm from "./AddFishForm";

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
    var keyBase = `fishes.${fishId}.`;

    return {
      name: `${keyBase}name`,
      price: `${keyBase}price`,
      status: `${keyBase}status`,
      desc: `${keyBase}desc`,
      image: `${keyBase}image`
    }
  }
});

export default Inventory;
