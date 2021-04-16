#' <Add Title>
#'
#' <Add Description>
#'
#' @import htmlwidgets crosstalk dplyr
#' @param data The dataset to visualize, where row names are features and each column is a sample.
#' The column names of this input must match the rownames of the `annotation` file.
#' @param annotation The metadata on each sample (column in `data`) denoting which expermental group each
#' sample (column) the sample belongs to. The rownames of this must match the column names of `data.
#' @param groupCol The column in the annotation file that contains the experimental factor on which to 
#' base the grouping of the input data.
#' @param plotName A title for the plot. Defaults to "ContrApption"
#' @param yAxisName A title for the y axis. Defaults to NULL
#' @param scaleWidth Factor to multiply the width of the widget by. Defaults to 1.
#' 
#' @export
ContrApption <- function(
  data = NULL,
  countsData = NULL,
  annotation,
  targetCol = "gene",
  sampleCol = "sampleID",
  mode = "counts",
  plotName = "ContrApption",
  yAxisName = "Expression",
  showLegend = FALSE,
  scaleWidth = 1
) {


  # preserve for htmlwidget; we're not using explicity
  width <- NULL
  height <- NULL
  elementId <- NULL

  # the data argument type must be NULL, SharedData, or data.frame
  if(!is.data.frame(data) & !crosstalk::is.SharedData(data) & !is.null(data)) {
    stop(
      paste(
        "data argument must be a SharedData object or a data.frame: ", 
        "recieved input of class:", class(data))
    )
  }

  # the countsData argument type must be NULL, SharedData, or data.frame
  if(!is.data.frame(countsData) & !crosstalk::is.SharedData(countsData) & !is.null(countsData)) {
    stop(
      paste(
        "data argument must be a SharedData object or a data.frame: ", 
        "recieved input of class:", class(countsData))
    )
  }

  # the countsData argument type must be data.frame
  if(!is.data.frame(annotation)) {
    stop(
      paste(
        "data argument must be a SharedData object or a data.frame: ", 
        "recieved input of class:", class(annotation))
    )
  }   

  # if we're in counts mode, just pass the counts
  if(mode == "counts" & !crosstalk::is.SharedData(data)) {
    # if we have counts, and not crosstalk, we are in normal mode
    # make the gene name column
    data <- data.frame(data)

    # default to making a column named "gene"
    if(targetCol == "gene") {
        data$gene <- rownames(data)
    } # or else we're using the user specified column
    countsData <- data
  }

  if(sampleCol == "sampleID") {
    annotation$sampleID <- rownames(annotation)
  } # or else we're using the user specified column

  if(crosstalk::is.SharedData(data)) {
    # Using Crosstalk
    usingCrosstalk <- TRUE
    key <- data$key()
    group <- data$groupName()
    data <- data$origData()
  } else {
    # Not using Crosstalk
    usingCrosstalk <- FALSE
    key <- NULL
    group <- NULL
  }


  # TODO: catch no usable targetCol here
  inputs = list(
    data = data,
    countsData = countsData,
    annotation = annotation,
    targetCol = targetCol,
    sampleCol = sampleCol,
    plotName = plotName,
    yAxisName = yAxisName,
    showLegend = showLegend,
    scaleWidth = scaleWidth,
    usingCrosstalk = usingCrosstalk,
    mode = mode,
    settings = list(
      crosstalk_key = key,
      crosstalk_group = group
    )
  )

  # create widget
  htmlwidgets::createWidget(
    name = 'ContrApption',
    inputs,
    width = width,
    height = height,
    package = 'ContrApption',
    elementId = elementId,
    dependencies = crosstalk::crosstalkLibs(),
    sizingPolicy = htmlwidgets::sizingPolicy(
      defaultWidth = 950, 
      defaultHeight = 530, 
      browser.fill = FALSE
    )
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
ContrApptionOutput <- function(outputId, width = '100%', height = '400px') {
  htmlwidgets::shinyWidgetOutput(outputId, 'ContrApption', width, height, package = 'ContrApption')
}

#' @rdname ContrApption-shiny
#' @export
renderContrApption <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  htmlwidgets::shinyRenderWidget(expr, ContrApptionOutput, env, quoted = TRUE)
}