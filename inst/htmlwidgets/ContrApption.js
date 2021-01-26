HTMLWidgets.widget({

  name: 'ContrApption',

  type: 'output',

  factory: function(el, width, height) {

    // create blank plot in global scope
    var plot = Plotly.plot(
      graphDi = el,
      data = [],
      layout = {
        margin: { t: 0 }
      },
    );

    return {

      renderValue: function(inputs) {
        
        // update the base plot with R inputs
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

        
        console.log("render")
        console.log(inputs.counts)
      },

      resize: function(width, height) {

        // TODO: code to re-render the widget with a new size

      },

      // advised by docs, not sure how I'd use it
      plot: plot

    }; // return 
  } // factory
});
