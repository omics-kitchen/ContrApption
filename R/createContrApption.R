
#' <Add Title>
#'
#' <Add Description>
#' @export
createContrApption <- function(
  counts, annotation,
  deResults = NULL, 
  plotName = "ContrApption",
  yAxisName = "Expression",
  targetCol = "gene",
  sampleCol = "sampleID",
  showLegend = FALSE
  )
{
  
  # if there is no de data and no shared objects, we're making a simple, single widget
  if(!crosstalk::is.SharedData(counts) & is.null(deResults)) {
    # removing the targetcol from here doesn't seem to break the vignete
    return(
      ContrApption(
        data = counts,
        annotation = annotation,
        yAxisName = yAxisName,
        plotName = plotName,
        targetCol = targetCol,
        sampleCol = sampleCol,
        showLegend = showLegend
      )
    )
  }
  # else, we're making a paired widget of some kind

  # if there is no DE data, make a counts and table widget
  if(is.null(deResults)) {

    dtData <- counts

    contrWidget <- ContrApption(
      data = dtData,
      annotation = annotation,
      yAxisName = yAxisName,
      plotName = plotName,
      targetCol = targetCol,
      sampleCol = sampleCol,
      showLegend = showLegend,
      scaleWidth = 0.5 # makes room for other widgets
    )

  # if there is DE data, use that for interactivity, use counts as secondary
  # (meaning that we're in de and boxplot mode)
  } else {

    dtData <- deResults

    contrWidget <- ContrApption(
      data = dtData,
      countsData = counts,
      annotation = annotation,
      yAxisName = yAxisName,
      plotName = plotName,
      targetCol = targetCol,
      sampleCol = sampleCol,
      mode = "diff-expression",
      scaleWidth = 0.5 # makes room for other widgets
    )

  }

  # DT table of DE results
  dtWidget <- DT::datatable(
    dtData,
    extensions = "Scroller",
    style = "bootstrap",
    class = "compact",
    width = "100%",
    selection = 'single', # ContrApption works on one target at a time
    options = list(
      deferRender = TRUE,
      scroller = TRUE,
      scrollY = 300,
      sScrollX = "100%",
      pagingType = "simple",
      initComplete = JS(
        "function(settings, json) {",
          "$(this.api().table().header()).css({'font-size': '75%'});",
        "}"
      )
    )
  ) %>% 
  DT::formatStyle(columns = seq(1, ncol(dtData$origData())), fontSize = '75%')

  bscols(dtWidget, contrWidget)

}