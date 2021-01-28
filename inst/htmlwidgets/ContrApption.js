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

          // a list of every state we've seen so far
          let statesObserved = [];

          // the actual map of samples to their group state
          let stateMap = {};
          let listData = samples.listData;

          // for every state the group can be in the sample sheet...
          for(let i = 0; i < samples.nrows; i++){

            let group = listData[groupCol][i]
            let sample = listData[idCol][i]

            // map the current ID to that state
            stateMap[sample] = group

            if(!statesObserved.includes(group)) {
              statesObserved.push(group)
            }
          }

          // I'm going to add logic for including arbitrary numbers of states
          if(statesObserved.length != 2) {
            console.log("more than two possible states")
            
          }

          return stateMap

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

        // unpack inputs from R
        let counts = inputs.counts;
        let genes = inputs.genes;
        let samples = inputs.samples;
        let idCol = inputs.idCol;
        let groupCol = inputs.groupCol;

        // let startingGene = counts
        console.log(counts)
        console.log(genes)

 
       let stateMap = mapSamplesToGroups(samples, idCol, groupCol)

       console.log(stateMap);

      }, // renderValue

      resize: function(width, height) {

        // TODO: code to re-render the widget with a new size

      },

      // advised by docs, not sure how I'd use it
      plot: plot

    }; // return 
  } // factory
});
