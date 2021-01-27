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

        function mapSamplesToGroups(samples, idCol, groupCol){

          let stateMap = {};
          let listData = samples.listData;

          for(let i = 0; i < samples.nrows; i++){
            let group = listData[groupCol][i]
            let sample = listData[idCol][i]
            stateMap[sample] = group
          }

          console.log(stateMap);

        }
        
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

        
        // console.log("render")
        // console.log(inputs.counts)
 
        mapSamplesToGroups(inputs.samples, inputs.idCol, inputs.groupCol)
      }, // renderValue

      resize: function(width, height) {

        // TODO: code to re-render the widget with a new size

      },

      // advised by docs, not sure how I'd use it
      plot: plot

    }; // return 
  } // factory
});
