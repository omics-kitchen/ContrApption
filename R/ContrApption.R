#' <Add Title>
#'
#' <Add Description>
#'
#' @import htmlwidgets
#' @import dplyr
#' @export
ContrApption <- function(
  data, # dataset to visualize
  annotation, # metadata on the columns showing which belongs to which group
  idCol, # the column name where the samples IDs are store
  groupCol, # the column in the sample sheet that denotes the group statuses, what is being studied with the plot
  width = NULL,
  height = NULL,
  elementId = NULL,
  log2 = FALSE, # TODO
  plotName = NULL # TODO
) {

  # make the gene name column
  data <- data %>% data.frame
  data$gene <- rownames(data)
  
  inputs = list(
    message = message,
    data = data,
    annotation = annotation,
    idCol = idCol,
    groupCol = groupCol
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
