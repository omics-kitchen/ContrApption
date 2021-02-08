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



        // we start coding for real here
        function mapSamplesToGroups(annotation, idCol, groupCol){

          // a list of every state we've seen so far
          let statesObserved = [];

          // the actual map of samples to their group state
          let stateMap = {};
          let listData = annotation.listData;

          // for every state the group can be in the sample sheet...
          for(let i = 0; i < annotation.nrows; i++){
            let group = listData[groupCol][i]
            let sample = listData[idCol][i]
            // map the current ID to that state
            stateMap[sample] = group
            if(!statesObserved.includes(group)) {
              statesObserved.push(group)
            }
          }
          return {states: statesObserved, map: stateMap}
        }



        function filterDataByGroupAndGene(d, gene, sampleMetadata){

          // the list of possible gene
          geneList = Object.values(d['gene'])

          // establish the index of the gene we want
          let geneIndex = null;          
          for(i in geneList){
            if(geneList[i] == gene){
              geneIndex = i
            }
          }

          let states = sampleMetadata.states
          let samplesMap = sampleMetadata.map

          // on object to store results neatly
          results = {};
          // fir each state
          for(i in states){
            // note the state name
            currentState = states[i]
            // prepare a property to store results under that name
            results[currentState] = {};
            // for each sample we have...
            for(sample in samplesMap) {
              // ...if it's the one we're currently assembling...
              if(samplesMap[sample] == currentState) {
                // ... look it up in the table and note count
                results[currentState][sample] = d[sample][geneIndex]
              }
            }
          }
          return results
        }



        function formatDataForPlotly(d) {
          let output = [];
          for(i in d) {
            let traceArray = [];
            let counts = Object.values(d[i])
            for(j in counts){
              traceArray.push(counts[j])
            }
            output.push({y: traceArray, type: 'box', name: i})
          }
          return output
        }

        // unpack inputs from R
        let dataSet = inputs.data;
        let annotation = inputs.annotation;
        let idCol = inputs.idCol;
        let groupCol = inputs.groupCol;

        let initialGene = dataSet['gene'][0]
        let stateMap = mapSamplesToGroups(annotation, idCol, groupCol)
        let filteredData = filterDataByGroupAndGene(dataSet, initialGene, stateMap)
        let plotlyData = formatDataForPlotly(filteredData);

        // let select = d3
        //   .select(el)
        //   .append("div")
        //   .attr("id", "d3-dropdown")
        //   // .style("width", 50)
        //   .append("select")
        //   .text(function(d) { return d})

        Plotly.react(
          graphDi = el,
          data = plotlyData,
          layout = {
            margin: { t: 0 }
          },
        );

      }, // renderValue

      resize: function(width, height) {

        // TODO: code to re-render the widget with a new size

      },

      // advised by docs, not sure how I'd use it
      plot: plot

    }; // return 
  } // factory
});
