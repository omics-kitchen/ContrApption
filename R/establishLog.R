library(log4r)
establishLog <- function() {

  logFile <- "ContrApption.log"

  logger <- log4r::logger(
    threshold = "INFO",
    appenders = list(
      file_appender(
        logFile,
        append = TRUE,
        layout = default_log_layout()
      )
    )
  )

  logFcn <- function(msg) {
    log4r::info(logger, msg)
  }

  list(logger = logger, logFcn = logFcn)
}