/* note: the data processing steps required for this app are stored in 'lib/contraptiontools' to keep this mangeable */
HTMLWidgets.widget({

  name: 'ContrApption',

  type: 'output',

  factory: function(el, width, height) {

    /* global variables  */
    var plot = Plotly.plot(graphDiv = el, data = [])
    var plotlyData;
    // need to be passed to renderValue and resize
    var plotName;
    var yAxisName;
    var layout;
    var selectedGene;
    var selectedGroup;
    var geneDropdownName;
    var groupDropdownName;
    var dropDownWidth;
    var showLegend;
    // crosstalk handle for interactivivty across widgets
    var selHandle = new crosstalk.SelectionHandle();
    var useGeneDropDown = true;


    return {
      
      renderValue: function(inputs) {

        /* ---------- unpack inputs from R ---------- */
        let dataSet = inputs.countsData;
        let dataExpr = inputs.data;

        if(inputs.usingCrosstalk == true && inputs.mode == "counts"){
          dataSet = inputs.data
        }

        if(inputs.mode == "diff-expression"){
          dataSet = inputs.countsData
          dataExpr = inputs.data;
          useGeneDropDown = false;
        }

        if(inputs.usingCrosstalk == true) {
          useGeneDropDown = false;
        }
        
        let targetCol = inputs.targetCol;
        let annotation = inputs.annotation;
        let sampleCol = inputs.sampleCol;
        let scaleWidth = inputs.scaleWidth;
        width = width * scaleWidth;
        let allTranscripts = dataSet[targetCol];

        let allGroups = Object.keys(annotation);

        plotName = inputs.plotName;
        yAxisName = inputs.yAxisName;
        showLegend = inputs.showLegend;



        /* ---------- get initial data and create initial plot ---------- */

        // start on the first gene in the list
        selectedGene = allTranscripts[0];
        selectedGroup = allGroups[0];

        // create initial layout of the plot
        layout = updateLayout(plotName, selectedGene, yAxisName, height, width, showLegend)
        // get the data for current inputs
        plotlyData = updatePlotlyData(annotation, dataSet, selectedGene, selectedGroup, targetCol, sampleCol)
        // update the plot
        Plotly.react(graphDiv = el, data = plotlyData, layout = layout)





        /* ---------- structure the HTML components of the app ---------- */ 

        // make dropdown id (permits multiple widgets per book)
        var dropdownID = generateID(15)
        var dropdownOuter = "dropdown-outer-" + dropdownID
        
        // make unique names for gene and group dropdown with the IDs
        geneDropdownName = "dropdown-gene" + dropdownID
        groupDropdownName = "dropdown-group" + dropdownID

        // make the dropdowns 25% of the width each
        dropDownWidth = 0.4 * width

        // pad the bottom the widget to make room
        d3.select(el).style("padding-bottom", "15px")

        // an outer div in which to place the two dropdown
        d3.select(el)
          .append("div")
          .attr("id", dropdownOuter)
          .style("padding-bottom", "30px")
          .lower()

                  // add the 'group' dropdown to the selector div
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
      
      // add search to dropdown
      new SlimSelect({ select: "#" + groupDropdownName })

        // add the 'gene' dropdown to the selector div
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

        // add search to dropdown
        new SlimSelect({ select: "#" + geneDropdownName }) 






        /* ---------- handle inputs, updates ---------- */

        // update the plot from dropdown input
        function updateFromDropDowns(groupDropdownName, geneDropdownName) {
          // note current selections
          selectedGroup = d3.select('#' + groupDropdownName + ' option:checked').text();

          selectedGene = d3.select('#' + geneDropdownName + ' option:checked').text();

          // pass the new gene to the layout 
          layout = updateLayout(plotName, selectedGene, yAxisName, height, width, showLegend)
          // filter the data given the current selections
          plotlyData = updatePlotlyData(annotation, dataSet, selectedGene, selectedGroup, targetCol, sampleCol)
          //update the plotly graph 
          Plotly.react(graphDiv = el, data = plotlyData, layout = layout)

          if(useGeneDropDown) {
            selHandle.set([selectedGene])
          }

        }

        // update the plot from crosstalk input
        function updateFromCrosstalk(event) {
          if (event.sender !== selHandle) {
            if(typeof event.value[0] == "undefined") {
              let selectedGene = d3.select('#' + geneDropdownName + ' option:checked').text();
            } else {
              selectedGene = event.value[0]
            }
            layout = updateLayout(plotName, selectedGene, yAxisName, height, width, showLegend)
            plotlyData = updatePlotlyData(annotation, dataSet, selectedGene, selectedGroup, targetCol, sampleCol)
            Plotly.react(graphDiv = el, data = plotlyData, layout = layout)
          }
        }

        // update from gene dropdown
        d3.select("#" + geneDropdownName)
          .on("change", function(){
            updateFromDropDowns(groupDropdownName, geneDropdownName);
          })

        // update from group dropdown
        d3.select("#" + groupDropdownName)
          .on("change", function(){
            updateFromDropDowns(groupDropdownName, geneDropdownName); 
          })

        // turn off the dropdown if we're not using it
        if(!useGeneDropDown) {
          dropDownHTML = document.getElementById(dropdownOuter).children
          dropDownHTML[0].style.display = 'none';
          dropDownHTML[1].style.display = 'none';
        }


        // update from crosstalk
        selHandle.on("change", function(event) { updateFromCrosstalk(event) })

        selHandle.setGroup(inputs.settings.crosstalk_group);

      }, // renderValue


      
      resize: function(width, height) {
        
        // adjust the size of the main element
        d3.select(el)
          .select("svg")
          .attr("width", width)
          .attr("height", height);
        
        // adjust the size of the dropdowns
        d3.select(el)
          .selectAll(".ss-main")
          .style("width", 0.4 * width + "px")
        
        // update plotly
        layout = updateLayout(plotName, selectedGene, yAxisName, height, width, showLegend);

        Plotly.react(graphDiv = el, data = plotlyData, layout = layout)
      },

      // advised by docs, not sure how I'd use it
      plot: plot

    }; // return 
  } // factory
}); // widget