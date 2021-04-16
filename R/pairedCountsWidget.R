#' <Add Title>
#'
#' <Add Description>
#' @export
pairedCountsWidget <- function(data, annotation)
{

  # wrapper for the two widgets
  bscols(
    # DT table of DE results
    datatable(
      data,
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
    formatStyle(columns = seq(1, ncol(data$origData())), fontSize = '75%'),
    # ContrApption widget
    ContrApption(
      data = data,
      annotation = annotation,
      scaleWidth = 0.5 # makes room for other widgets
    )
  )
}