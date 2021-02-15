HTMLWidgets.widget({

  name: 'ContrApption',

  type: 'output',

  factory: function(el, width, height) {

    /* create blank plot in global scope */
    var plot = Plotly.plot(graphDiv = el, data = []);

    // the rest of the logic is conducted in the rendering  function
    return {

      renderValue: function(inputs) {

        /* define the core functions */

        // associates samples to groups (sorts to experiment and control, etc)
        function mapSamplesToGroups(annotation, groupCol){

          // a list of every state we've seen so far
          let statesObserved = [];

          // the actual map of samples to their group state
          let stateMap = {};
          
          // for every i in 0 -> the sample length
          for(let i = 0; i < annotation.sampleID.length; i++){
            // the sample is the value of sampleID there
            let sample = annotation.sampleID[i];
            // the group of that sample is the value of the groupcol at i
            let group = annotation[groupCol][i];
            // map the current ID to that group state
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
            output.push(
              {
                y: traceArray,
                type: "box",
                name: i,
                boxmean: "sd",
                boxpoints: "all",
                jitter: 0.2,
                pointpos: 0
              }
            )
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
        let groupCol = inputs.groupCol;
        let plotName = inputs.plotName;
        let yAxisName = inputs.yAxisName;

        
        /* get initial data and create initial plot */

        // start on the first gene in the list
        let initialGene = dataSet['gene'][0];

        // assign each sample a state based on the group of interest (disease/control, etc)
        let stateMap = mapSamplesToGroups(annotation, groupCol);

        // use the statemap to sort the entries for a specific gene
        let filteredData = filterGroupDataByGene(dataSet, initialGene, stateMap);

        // format that data for plotly
        let plotlyData = formatDataForPlotly(filteredData);

        // create a layout for the new plot
        var layout = {
          title: plotName,
          autosize: false,
          margin: {
            // l: 10,  
            // r: 10,
            // b: 10,
            // t: 10,
            // pad: 4
          },
          yaxis: {
            title: yAxisName,
            titlefont: {
              family: 'Arial, sans-serif',
              size: 12,
              color: 'grey'
            }
          }
        }

        // update the empty plot with the data
        Plotly.react(graphDiv = el, data = plotlyData, layout = layout);


        // // pad the bottom the widget to make room
        // d3.select(el).style("padding-bottom", "30px")

        
        /* add dropdown and handle updates to it */

        // make dropdown id (permits multiple widgets per book)
        let dropdownName = "dropdown-" + makeid(15)

        d3.select(el)
          .append("select")                           // add a select element
          .lower()                                    // move the select to the top of the element 
          .attr("id", dropdownName)                   // give it a unique ID
          .selectAll("option")                        // selects options of that element
          .data(dataSet['gene'])                      // set the gene list as the selections
          .enter()                                    // saves the data to that element
          .append("option")                           // adds options 
          .attr("value", function (d) { return d; })  // puts the data (gene names as the options)
          .text(function (d) { return d; })           // adds the text of the gene to the display
        
        // add the searchble dropdown
        new SlimSelect({
          select: "#" + dropdownName
        })

        // handle updates to the dropdown
        d3.select("#" + dropdownName)
          .on("change", function() {
            // get the gene currently check in the dropdown
            const selectedGene = d3.select('#' + dropdownName + ' option:checked').text();
            console.log(selectedGene)
            // re-filter data based on that gene
            let filteredData = filterGroupDataByGene(dataSet, selectedGene, stateMap);
            // format the dataset for plotly
            let plotlyData = formatDataForPlotly(filteredData);
            // cue reaction from plotly to update
            Plotly.react(graphDiv = el, data = plotlyData, layout = layout);
          })



      }, // renderValue

      // resize: function(width, height) {
      //   // TODO: code to re-render the widget with a new size
      // },

      // advised by docs, not sure how I'd use it
      plot: plot

    }; // return 
  } // factory
});
