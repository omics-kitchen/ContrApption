HTMLWidgets.widget({

  name: 'ContrApption',

  type: 'output',

  factory: function(el, width, height) {


    /* create blank plot in global scope */
    var plot = Plotly.plot(graphDiv = el, data = []);

    var sel_handle = new crosstalk.SelectionHandle();

    // sel_handle.on("change", function(e) {
    //   console.log("HEY")
    //   if (e.sender !== sel_handle) {
    //     console.log("WHAT IN FUCK")
    //     console.log(e.value[0])
    //   }
    // })

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


        function updatePlotlyData() {
          // get the gene currently check in the dropdown
          let selectedGroup = d3.select('#' + groupDropdownName + ' option:checked').text();
          let selectedGene = d3.select('#' + geneDropdownName + ' option:checked').text();

          let stateMap = mapSamplesToGroups(annotation, selectedGroup);
          // re-filter data based on that gene
          let filteredData = filterGroupDataByGene(dataSet, selectedGene, stateMap);
          // format the dataset for plotly
          return formatDataForPlotly(filteredData);
        }


        /* unpack inputs from R */

        let dataSet = inputs.data;
        let annotation = inputs.annotation;
        let plotName = inputs.plotName;
        let yAxisName = inputs.yAxisName;
        let allTranscripts = dataSet['gene'];
        let allGroups = Object.keys(annotation)

        /* get initial data and create initial plot */

        // start on the first gene in the list
        let initialGene = allTranscripts[0];
        let initialGroup = allGroups[0];

        // assign each sample a state based on the group of interest (disease/control, etc)
        let stateMap = mapSamplesToGroups(annotation, initialGroup);

        // use the statemap to sort the entries for a specific gene
        let filteredData = filterGroupDataByGene(dataSet, initialGene, stateMap);

        // format that data for plotly
        let plotlyData = formatDataForPlotly(filteredData);

        // create a layout for the new plot
        var layout = {
          title: plotName,
          autosize: false,
          height: 400,
          width: 750,
          margin: {
            l: 10,  
            r: 10,
            b: 75,
            t: 35,
            pad: 10
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

        // pad the bottom the widget to make room
        d3.select(el).style("padding-bottom", "15px")

        // update the empty plot with the data
        Plotly.react(graphDiv = el, data = plotlyData, layout = layout);


        /* add dropdown and handle updates to it */

        // make dropdown id (permits multiple widgets per book)
        let dropdownID = makeid(15)
        let dropdownOuter = "dropdown-outer-" + dropdownID
        let geneDropdownName = "dropdown-gene" + dropdownID
        let groupDropdownName = "dropdown-group" + dropdownID

        // an outer div in which to place the two dropdown
        d3.select(el)
          .append("div")
          .attr("id", dropdownOuter)
          .style("padding-bottom", "30px")
          .lower()
        
        
        d3.select("#" + dropdownOuter)
          .append("select")                           // add a select element
          .style("float", "left")                               
          .style("width", "150px")
          .style("padding-left", "10px")
          .attr("id", groupDropdownName)              // give it a unique ID
          .lower()
          .selectAll("option")                        // selects options of that element
          .data(allGroups)                      // set the gene list as the selections
          .enter()                                    // saves the data to that element
          .append("option")                           // adds options 
          .attr("value", function (d) { return d; })  // puts the data (gene names as the options)
          .text(function (d) { return d; })           // adds the text of the gene to the display


        d3.select("#" + dropdownOuter)
          .append("select")                           // add a select element
          .style("float", "left")                              
          .style("width", "150px")
          .style("padding-right", "10px")
          .attr("id", geneDropdownName)               // give it a unique ID
          .lower()
          .selectAll("option")                        // selects options of that element
          .data(allTranscripts)                      // set the gene list as the selections
          .enter()                                    // saves the data to that element
          .append("option")                           // adds options 
          .attr("value", function (d) { return d; })  // puts the data (gene names as the options)
          .text(function (d) { return d; })           // adds the text of the gene to the display



        
        // add the searchble dropdown
        new SlimSelect({
          select: "#" + geneDropdownName
        })

        new SlimSelect({
          select: "#" + groupDropdownName
        })

        // handle updates to the dropdown
        d3.select("#" + geneDropdownName)
          .on("change", function(){
            Plotly.react(graphDiv = el, data = updatePlotlyData(), layout = layout)
          })

        d3.select("#" + groupDropdownName)
          .on("change", function(){
            Plotly.react(graphDiv = el, data = updatePlotlyData(), layout = layout)
          })

        

        sel_handle.on("change", function(e) {
          console.log("down here!")
          if (e.sender !== sel_handle) {
            console.log(e.value[0])
            // get the gene currently check in the dropdown
            let selectedGroup = d3.select('#' + groupDropdownName + ' option:checked').text();
            let selectedGene = e.value[0]
            let stateMap = mapSamplesToGroups(annotation, selectedGroup);
            // re-filter data based on that gene
            let filteredData = filterGroupDataByGene(dataSet, selectedGene, stateMap);
            // format the dataset for plotly
            Plotly.react(graphDiv = el, data = formatDataForPlotly(filteredData), layout = layout)
          }
        })
        
        sel_handle.setGroup(inputs.settings.crosstalk_group);
          
        // sel_handle.on("change", function(e) {
        //   if (e.sender !== sel_handle) {
        //     console.log(e.value[0])
        //   }
        // })

      }, // renderValue




      resize: function(width, height) {
        // TODO: code to re-render the widget with a new size
        // plot.width(width-30).height(height-30)(false);
      },


      // advised by docs, not sure how I'd use it
      plot: plot

    }; // return 
  } // factory
});
