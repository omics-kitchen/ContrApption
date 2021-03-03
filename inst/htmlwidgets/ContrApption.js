

HTMLWidgets.widget({

  name: 'ContrApption',

  type: 'output',

  factory: function(el, width, height) {

    /* global variables  */
    var plot = Plotly.plot(graphDiv = el, data = [], config = {responsive: true});
    var plotName;
    var yAxisName;
    var layout;
    var selectedGene;
    var selectedGroup;
    var geneDropdownName;
    var groupDropdownName;
    var dropDownWidth;
    var plotlyData;

    // var ns = {
    //   plot: Plotly.plot(
    //     graphDiv = el,
    //     data = [],
    //     config = { responsive: true }
    //   ),
    //   plotName: plotName,
    //   yAxisName: yAxisName,
    //   layout: layout, 
    //   selectedGene: selectedGene,
    //   selectedGroup: selectedGroup,
    //   geneDropdownName: geneDropdownName,
    //   groupDropdownName: groupDropdownName, 
    //   dropDownWidth: dropDownWidth, 
    //   plotlyData: plotlyData
    // }

    // crosstalk handle
    var sel_handle = new crosstalk.SelectionHandle();

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

        function updateGobalGeneAndGroup() {
          selectedGroup = d3.select('#' + groupDropdownName + ' option:checked').text();
          selectedGene = d3.select('#' + geneDropdownName + ' option:checked').text();
        }

        function updateLayout() {
          return {
            title: '<b>' + plotName + '</b> <br>' + selectedGene,
            autosize: false,
            height: height * 0.9,
            width: width * 0.9,
            margin: { l: 10, r: 10, b: 75, t: 35, pad: 10 },
            yaxis: {
              title: yAxisName,
              titlefont: { family: 'Arial, sans-serif', size: 12, color: 'grey' }
            }
          }
        }

        function updatePlotlyData() {
          // get the gene currently check in the dropdown
          let stateMap = mapSamplesToGroups(annotation, selectedGroup);
          // re-filter data based on that gene
          let filteredData = filterGroupDataByGene(dataSet, selectedGene, stateMap);
          // format the dataset for plotly
          return formatDataForPlotly(filteredData);
        }

        function UpdatePlotFromDropdown(){
          updateGobalGeneAndGroup();
          layout = updateLayout(); 
          plotlyData = updatePlotlyData()
          Plotly.react(graphDiv = el, data = plotlyData, layout = layout)
        }

        function updatePlotFromCrosstalk(e){
          if (e.sender !== sel_handle) {
            selectedGene = e.value[0]
            layout = updateLayout(); 
            plotlyData = updatePlotlyData()
            Plotly.react(graphDiv = el, data = plotlyData, layout = layout)
          }
        }


        /* unpack inputs from R */

        let dataSet = inputs.data;
        let annotation = inputs.annotation;
        let allTranscripts = dataSet['gene'];
        let allGroups = Object.keys(annotation);

        // globals
        plotName = inputs.plotName;
        yAxisName = inputs.yAxisName;
        
        // let bscolSize = inputs.bscolSize;

        // if(bscolSize == true){
        //   console.log(bscolSize)
        //   width = width/2
        // }


        /* get initial data and create initial plot */

        // start on the first gene in the list
        selectedGene = allTranscripts[0];
        selectedGroup = allGroups[0];

        layout = updateLayout(); 
        plotlyData = updatePlotlyData()

        Plotly.react(graphDiv = el, data = plotlyData, layout = layout)


        /* structure the HTML components of the app */

        // pad the bottom the widget to make room
        d3.select(el).style("padding-bottom", "15px")

        // make dropdown id (permits multiple widgets per book)
        let dropdownID = makeid(15)
        let dropdownOuter = "dropdown-outer-" + dropdownID

        geneDropdownName = "dropdown-gene" + dropdownID
        groupDropdownName = "dropdown-group" + dropdownID
        dropDownWidth = 0.3 * width

        // an outer div in which to place the two dropdown
        d3.select(el)
          .append("div")
          .attr("id", dropdownOuter)
          .style("padding-bottom", "30px")
          .lower()
        
        
        d3.select("#" + dropdownOuter)
          .append("select")                           // add a select element
          .style("float", "left")                     // float to the left of the div
          .style("width", dropDownWidth + "px")       // set the dropdown width to 1/3rd of the widget width
          .style("padding-left", "10px")              // a little breathing room for the divs
          .attr("id", groupDropdownName)              // give it a unique ID
          .lower()                                    // moves dropdown 'up' in the div
          .selectAll("option")                        // selects options of that element
          .data(allGroups)                            // set the gene list as the selections
          .enter()                                    // saves the data to that element
          .append("option")                           // adds options 
          .attr("value", function (d) { return d; })  // puts the data (gene names as the options)
          .text(function (d) { return d; })           // adds the text of the gene to the display


        d3.select("#" + dropdownOuter)
          .append("select")                           // add a select element
          .style("float", "left")                     // float to the left of the div
          .style("width", dropDownWidth + "px")       // set the dropdown width to 1/3rd of the widget width
          .style("padding-right", "10px")             // a little breathing room for the divs
          .attr("id", geneDropdownName)               // give it a unique ID
          .lower()                                    // moves dropdown 'up' in the div
          .selectAll("option")                        // selects options of that element
          .data(allTranscripts)                       // set the gene list as the selections
          .enter()                                    // saves the data to that element
          .append("option")                           // adds options 
          .attr("value", function (d) { return d; })  // puts the data (gene names as the options)
          .text(function (d) { return d; })           // adds the text of the gene to the display

        // add the searchble dropdown
        new SlimSelect({ select: "#" + geneDropdownName })

        new SlimSelect({ select: "#" + groupDropdownName })


        /* handle inputs, updates */

        // gene dropdown
        d3.select("#" + geneDropdownName)
          .on("change", function(){ UpdatePlotFromDropdown(); })

        // group dropdown
        d3.select("#" + groupDropdownName)
          .on("change", function(){ UpdatePlotFromDropdown(); })
        
        // from crosstalk
        sel_handle.on("change", function(e) { updatePlotFromCrosstalk(e); })
        sel_handle.setGroup(inputs.settings.crosstalk_group);
          
        // sel_handle.on("change", function(e) {
        //   if (e.sender !== sel_handle) {
        //     console.log(e.value[0])
        //   }
        // })

      }, // renderValue


      
      resize: function(width, height) {
        
        console.log("resize called")

        d3.select(el)
          .select("svg")
          .attr("width", width)
          .attr("height", height);
        
        let dropDownWidth = 0.3 * width

        d3.select("#" + geneDropdownName)
          .style("width", dropDownWidth + "px")
        
        d3.select("#" + groupDropdownName)
          .style("width", dropDownWidth + "px")
        
        layout = updateLayout();
        
        Plotly.react(graphDiv = el, data = plotlyData, layout = layout)
      },

      // advised by docs, not sure how I'd use it
      plot: plot

    };  // return 
  } // factory
}); // widget