function getDesignInfo(d, stateColumn) {

  let states = [];
  let stateMap = {};
  for(let i = 0; i < d.length; i++) {
      let current = d[i];
      // console.log(current);
      if(!states.includes(current[stateColumn])) {
          states.push(current[stateColumn]);
      }

      stateMap[current.ID] = current[stateColumn];
  } 
  return [states, stateMap]
}

function sortToArraysForPlotly(d, designMap) {
  let arrayForStateA = [];
  let arrayForStateB = [];
  // is there an enumerate like in Python?
  let dataAsKeys = Object.keys(d);
  let dataAsValues = Object.values(d);
  console.log(dataAsKeys);
  console.log(dataAsValues);
  for(let i = 0; i < dataAsKeys.length; i++) {
      let current = dataAsKeys[i];

      if(designMap[current] == "HF") {
          arrayForStateB.push(dataAsValues[i])
      } else {
          arrayForStateA.push(dataAsValues[i])
      }
  }
  return [arrayForStateA, arrayForStateB]
}

function callPlotlyBoxplot(arrayA, arrayB, name) {
  let trace1 = {y: arrayA, type: 'box'};
  let trace2 = {y: arrayB, type: 'box'};
  var layout = {title: name};
  Plotly.newPlot('myDiv', [trace1, trace2], layout);
}

function cleanCounts(dCounts){
  for(let i = 0; i < dCounts.length; i++){
      let currentObj =  dCounts[i];
      currentObj["gene"] = currentObj["_row"];
      delete currentObj[""];
  }
  return dCounts
}

async function drawBoxplot() {

  let dSamples = await require("./SamplesUsed.json");
  let dCounts = await require("./NormalizedCounts.json");
  
  let testGene = "A1BG";
  let testDesignColumnn = "Status";
  
  dCounts = cleanCounts(dCounts);

  let dFilteredByGene = dCounts.filter(i => { return i.gene == testGene })[0];
  let [designStates, designMap] = getDesignInfo(dSamples, testDesignColumnn);
  // let [stateA, stateB] = designStates;
  let [arrayForStateA, arrayForStateB] = sortToArraysForPlotly(dFilteredByGene, designMap);

  callPlotlyBoxplot(arrayForStateA, arrayForStateB, testGene)

  // d3.select("#selected-dropdown").text("first");
  let select = d3.select("body")
      .append("div")
      .attr("id", "d3-dropdown")
      // .style("width", 50)
      .append("select")
      .text(function(d) { return d})

  select.selectAll("option")
      .data(dCounts)
      .enter()
      .append("option")
      .attr("value", function (d) { return d._row; })
      .text(function (d) { return d._row; });

  // handle on click event
  d3.select("#d3-dropdown").on("change", function(d){

      const selectedText = d3.select('#d3-dropdown option:checked').text();
      console.log( selectedText );

      let dFilteredByGene = dCounts.filter(i => { return i.gene == selectedText })[0];
      let [designStates, designMap] = getDesignInfo(dSamples, testDesignColumnn);
      let [arrayForStateA, arrayForStateB] = sortToArraysForPlotly(dFilteredByGene, designMap);

      callPlotlyBoxplot(arrayForStateA, arrayForStateB, selectedText)
  })
}

drawBoxplot();

