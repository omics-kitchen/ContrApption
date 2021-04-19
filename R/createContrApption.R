
#' createContrApption
#'
#' A convinience wrapper that infers the type of ContrApption widget to create based on user the 
#' dataset(s) passed. Produces a simple boxplot widget, a paired counts table and boxplot widget,
#' or a paired differential expression table and boxplot widget.
#' @import DT
#' @param counts The counts to be visualized - see ContrApption function documentation for details.
#' @param annotation The metadata about the samples in the experiment see ContrApption function 
#' documentation for details.
#' @param deResults The differential expression results of the experiment to be visualixed, if desired.
#' @param plotName The title of the plot
#' @param  yAxisName The y axis label to use
#' @param targetCol The string name of the column in the counts data that contains the target names, ie
#' the gene or transcript names in an RNA-Seq experiment.
#' @param sampleCol The string name of the column in the annotation file that contains the unique IDs of
#' the samples
#' @param showLegend Adds legend to plot if true
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