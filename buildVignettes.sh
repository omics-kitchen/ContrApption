R -e "devtools::build_vignettes()"
mv doc/ inst/
R CMD INSTALL --no-multiarch --with-keep.source .
