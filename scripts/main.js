var React = require("react");
var ReactDom = require("react-dom");

var App = React.createClass({
  render: function() {
    return (
      <div className="catch-of-the-day">
        <div className="menu">
          <Header />
        </div>
        <Order />
        <Inventory />
      </div>
    );
  }
});

var StorePicker = React.createClass({
  render: function() {
    var name = "wes";
    return (
      <form className="store-selector">
        <h2>Please Enter A Store {name}</h2>
        <input type="text" ref="storeId" />
        <input type="submit" />
      </form>
    );
  }
});

ReactDom.render(<App />, document.querySelector("#main"));
