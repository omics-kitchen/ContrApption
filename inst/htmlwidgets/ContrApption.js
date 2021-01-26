HTMLWidgets.widget({

  name: 'ContrApption',

  type: 'output',

  factory: function(el, width, height) {

    // TODO: define shared variables for this instance
      let plot = Plotly.plot(
        el,[{
          x: [1, 2, 3, 4, 5],
          y: [1, 2, 4, 8, 16]
        }],
        {
          margin: { t: 0 }
        },
      );

    return {


      initialize: function(){
        console.log("init called");
      },

      renderValue: function(x) {

        console.log("renderValue called!!!!!");

        // TODO: code to render the widget, e.g.
        // el.innerText = x.message;
        console.log(x.message)
        console.log(plot)
      },

      resize: function(width, height) {

        // TODO: code to re-render the widget with a new size

      },

      plot: plot
      
    };
  }

});
