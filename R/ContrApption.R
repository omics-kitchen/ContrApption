#' <Add Title>
#'
#' <Add Description>
#'
#' @import htmlwidgets
#' @import DESeq2
#' @export
ContrApption <- function(
  message, # for debug
  x, # for plotly debug plot
  y, # for plotly debug plot
  dds = NULL, # DESeq2 object
  groupIndex, # the column in the sample sheet that denotes the group statuses
  width = NULL,
  height = NULL,
  elementId = NULL
  ) {

  # forward options using x
  genes <- rownames(dds)
  counts <- counts(dds, normalized = TRUE) %>% data.frame
  

  inputs = list(
    message = message,
    x = x,
    y = y,
    counts = counts[1:100, ],
    samples = colData(dds),
    groupIndex = groupIndex

  )

  # create widget
  htmlwidgets::createWidget(
    name = 'ContrApption',
    inputs,
    width = width,
    height = height,
    package = 'ContrApption',
    elementId = elementId
  )
}

#' Shiny bindings for ContrApption
#'
#' Output and render functions for using ContrApption within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a ContrApption
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name ContrApption-shiny
#'
#' @export
ContrApptionOutput <- function(outputId, width = '100%', height = '400px'){
  htmlwidgets::shinyWidgetOutput(outputId, 'ContrApption', width, height, package = 'ContrApption')
}

#' @rdname ContrApption-shiny
#' @export
renderContrApption <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  htmlwidgets::shinyRenderWidget(expr, ContrApptionOutput, env, quoted = TRUE)
}
