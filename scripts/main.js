var React = require("react");
var ReactDom = require("react-dom")

var StorePicker = React.createClass({
  render: function() {
    return (
      <p>hello</p>
    );
  }
});

ReactDom.render(<StorePicker/>, document.querySelector("#main"));
