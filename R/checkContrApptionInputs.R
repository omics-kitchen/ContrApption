checkContrApptionInput <- function(data, annotation)
{

  # for now we're dealing in matricies and data frames
  checkTypes <- function(dataInputs)
  {

    # enumerate the data args
    for(i in seq_along(dataInputs)) {
      # the string name of the argument
      inputName <- names(dataInputs)[i]
      # get the class of the data structure at the index of that argument
      inputClass <- class(dataInputs[[i]])[1] # get the first name returned by 'class()'
      # if that name isn't on the guest list...
      if(!(inputClass %in% c("data.frame", "matrix", "SharedData"))){
        # kick'em out
        stop(
          paste0(
            "Recieved invalid input type '", inputClass, "',  for argument '",
            inputName, "', please submit matrix or data.frame."
          )
        )
      }
    }
  }


  # do the rownames of the samples match the colnames of the numeric matrix?
  checkRowAndColnames <- function(dataInputs)
  {
    inputClass <- class(dataInputs[[1]])[1] # get the first name returned by 'class()'
    # if we have matrix or df input, make sure the rownames are good
    if(!(inputClass == "SharedData")) {
      # if an rownames from anno don't match the cols in data, bail
      #isFALSE doesn't work here - all.equal returns string mismatch
      if(!isTRUE(all.equal(rownames(annotation), colnames(data)))) {
        stop(
          paste0(
            "Rownames of annotation do not match colnames of data",
            "Run `rownames(annotation) == colnames(data)` to find differences"
          )
        )
      }
    }
  }

  # to make for neat enumeration and capture of arg name for error message
  dataInputs <- list(data = data, annotation = annotation)
  checkTypes(dataInputs)
  checkRowAndColnames(dataInputs)

}
