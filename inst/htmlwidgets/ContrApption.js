HTMLWidgets.widget({

  name: 'ContrApption',

  type: 'output',

  factory: function(el, width, height) {

  // TODO: define shared variables for this instance
    var plot = Plotly.plot(
      graphDi = el,
      data = [],
      layout = {
        margin: { t: 0 }
      },
    );

    return {

      renderValue: function(inputs) {

        console.log("renderValue called!!!!!");

        // TODO: code to render the widget, e.g.
        // el.innerText = inputs.message;
        // console.log(inputs.x)
        Plotly.react(
            graphDi = el,
            data = [{
              x: inputs.x,
              y: inputs.y
            }],
            layout = {
              margin: { t: 0 }
            },
          );
      },

      resize: function(width, height) {

        // TODO: code to re-render the widget with a new size

      },
      plot: plot 
    };
  }
});
