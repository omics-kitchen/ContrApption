#' <Add Title>
#'
#' <Add Description>
#' @export
pairedWidget <- function(counts, deResults = NULL, annotation)
{

  # if there is no DE data, just make a basic counts ContrApption widget
  if(is.null(deResults)) {
    dtData <- counts
    contrWidget <- ContrApption(
      data = dtData,
      annotation = annotation,
      scaleWidth = 0.5 # makes room for other widgets
    )
  # if there is DE data, use that for interactivity, use counts as secondary
  } else {
    dtData <- deResults
    contrWidget <- ContrApption(
      data = dtData,
      countsData = counts,
      annotation = annotation,
      mode = "diff-expression",
      scaleWidth = 0.5 # makes room for other widgets
    )
  }

  # DT table of DE results
  dtWidget <- datatable(
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
  formatStyle(columns = seq(1, ncol(dtData$origData())), fontSize = '75%')

  bscols(dtWidget, contrWidget)

}