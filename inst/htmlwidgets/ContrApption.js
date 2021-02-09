HTMLWidgets.widget({

  name: 'ContrApption',

  type: 'output',

  factory: function(el, width, height) {

    /* create blank plot in global scope */

    var plot = Plotly.plot(
      graphDi = el,
      data = [],
      layout = {
        margin: { t: 0 }
      },
    );

    return {

      renderValue: function(inputs) {

        /* define the core functions */

        // associates samples to groups (sorts to experiment and control, etc)
        function mapSamplesToGroups(annotation, idCol, groupCol){

          // a list of every state we've seen so far
          let statesObserved = [];

          // the actual map of samples to their group state
          let stateMap = {};
          let listData = annotation.listData;

          // for every state the group can be in the sample sheet...
          for(let i = 0; i < annotation.nrows; i++){
            let group = listData[groupCol][i];
            let sample = listData[idCol][i];
            // map the current ID to that state
            stateMap[sample] = group;
            // add it to the list if we haven't seen it yet
            if(!statesObserved.includes(group)) {
              statesObserved.push(group);
            }
          }
          // return the list of possible states and the map IDs to states
          return {states: statesObserved, map: stateMap};
        }


        // filters data to gene of interest while preserving groups
        function filterGroupDataByGene(d, gene, sampleMetadata){

          // the list of possible gene
          geneList = Object.values(d['gene']);

          // establish the index of the gene we want
          let geneIndex = null;          
          for(i in geneList){
            if(geneList[i] == gene){
              geneIndex = i;
            }
          }

          let states = sampleMetadata.states;
          let samplesMap = sampleMetadata.map;

          // on object to store results neatly
          results = {};
          // fir each state
          for(i in states){
            // note the state name
            currentState = states[i];
            // prepare a property to store results under that name
            results[currentState] = {};
            // for each sample we have...
            for(sample in samplesMap) {
              // ...if it's the one we're currently assembling...
              if(samplesMap[sample] == currentState) {
                // ... look it up in the table and note count
                results[currentState][sample] = d[sample][geneIndex];
              }
            }
          }
          return results;
        }


        // creates an array of traces for plotly
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


        // for making dropdown IDs (permits multiple widgets per Rmd)
        // https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
        function makeid(length) {
          let result = '';
          let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          let charactersLength = characters.length;
          for (var i = 0; i < length; i++ ) {
              result += characters.charAt(Math.floor(Math.random() * charactersLength));
          }
          return result;
        }


        /* unpack inputs from R */

        let dataSet = inputs.data;
        let annotation = inputs.annotation;
        let idCol = inputs.idCol;
        let groupCol = inputs.groupCol;


        /* get initial data and create initial plot */

        // start on the first gene in the list
        let initialGene = dataSet['gene'][0];

        // assign each sample a state based on the group of interest (disease/control, etc)
        let stateMap = mapSamplesToGroups(annotation, idCol, groupCol);

        // use the statemap to sort the entries for a specific gene
        let filteredData = filterGroupDataByGene(dataSet, initialGene, stateMap);

        // format that data for plotly
        let plotlyData = formatDataForPlotly(filteredData);

        // update the empty plot with the data
        Plotly.react(
          graphDi = el,
          data = plotlyData,
          layout = {
            margin: { t: 0 }
          },
        );


        /* add dropdown and handle updates to it */

        // make dropdown id (permits multiple widgets per book)
        let dropdownID = "d3-dropdown-" + makeid(15)

        // add a dropdown element
        d3.select(el)                // selects the element of the widget
          .append("div")             // adds a div for the dropdown
          .attr("id", dropdownID) // gives it a name 
          .append("select")          // puts a select in the div
          .selectAll("option")       // selects options of that element
          .data(dataSet['gene'])     // set the gene list as the selections
          .enter()                   // saves the data to that element
          .append("option")          // adds options 
          .attr("value", function (d) { return d; }) // puts the data (gene names as the options)
          .text(function (d) { return d; }); // adds the text of the gene to the display

        // handle updates to the dropdown
        d3.select("#" + dropdownID)
          // when a change is observed
          .on("change", function(){
            // get the gene currently check in the dropdown
            const selectedGene = d3.select('#' + dropdownID + ' option:checked').text();
            // re-filter data based on that gene
            let filteredData = filterGroupDataByGene(dataSet, selectedGene, stateMap);
            // format the dataset for plotly
            let plotlyData = formatDataForPlotly(filteredData);
            // cue reaction from plotly to update
            Plotly.react(
              graphDi = el,
              data = plotlyData,
              layout = {
                margin: { t: 0 }
              },
            );
          })



      }, // renderValue

      resize: function(width, height) {

        // TODO: code to re-render the widget with a new size

      },

      // advised by docs, not sure how I'd use it
      plot: plot

    }; // return 
  } // factory
});
