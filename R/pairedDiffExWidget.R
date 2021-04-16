#' <Add Title>
#'
#' <Add Description>
#' @export
pairedDiffExWidget <- function(deResults, counts, annotation)
{

  # wrapper for the two widgets
  bscols(
    # DT table of DE results
    datatable(
      deResults,
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
      formatStyle(columns = seq(1, ncol(deResults$origData())), fontSize = '75%'),

    # ContrApption widget
    ContrApption(
      data = deResults,
      countsData = counts,
      annotation = annotation,
      mode = "diff-expression",
      scaleWidth = 0.5 # makes room for other widgets
    )
  )
}