/* define the core functions */

// filters data to gene of interest while preserving groups
function filterGroupDataByGene(d, gene, targetCol, sampleMetadata) {
  // the list of possible gene
  geneList = Object.values(d[targetCol]);
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
  // for each state
  for(i in states){
    // prepare a property to store results under that name
    state = states[i]
    results[state] = {};
    // for each sample we have...
    for(sample in samplesMap) {
      // ...if it's the one we're currently assembling...
      if(samplesMap[sample] == state) {
        // ... look it up in the table and note count
        results[state][sample] = d[sample][geneIndex];
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
function generateID(length) {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// function updateSelections(groupDropdownName, geneDropdownName) {
//   selectedGroup = d3.select('#' + groupDropdownName + ' option:checked').text();
//   selectedGene = d3.select('#' + geneDropdownName + ' option:checked').text();
// }

function updateLayout(plotName, selectedGene, yAxisName, height, width) {
  let layout = {
    title: '<b>' + plotName + '</b> <br>' + selectedGene,
    autosize: false,
    height: height * 0.9,
    width: width * 0.9,
    // margin: { l: 10, r: 10, b: 75, t: 35, pad: 10 },
    xaxis:{},
    yaxis: {
      title: yAxisName,
      titlefont: {
        family: 'Arial, sans-serif',
        size: 12,
        color: 'grey'
      }
    },
    legend: {
      "orientation": "h",
      x: 1,
      y: 0.5
    }
  }
  return layout
}

function updatePlotlyData(annotation, dataSet, selectedGene, selectedGroup, targetCol, sampleCol) {

  // associates samples to groups (sorts to experiment and control, etc)
  function mapSamplesToGroups(annotation, groupCol) {
    // a list of every state we've seen so far
    let statesObserved = [];
    // the actual map of samples to their group state
    let stateMap = {};
    // for every i in 0 -> the sample length
    for(let i = 0; i < annotation[groupCol].length; i++){
      // the sample is the value of sampleID there
      let sample = annotation[sampleCol][i];
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

  // get the gene currently check in the dropdown
  let stateMap = mapSamplesToGroups(annotation, selectedGroup);
  // re-filter data based on that gene
  let filteredData = filterGroupDataByGene(dataSet, selectedGene, targetCol, stateMap);
  // format the dataset for plotly
  return formatDataForPlotly(filteredData);
}
