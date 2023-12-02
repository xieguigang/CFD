imports ["CFD", "Tcp"] from "CFD_clr";

[@info "the tcp port that specificed for run the background service."]
[@type "integer"]
let debug as integer = ?"--debug" || NULL;

if (!is.null(debug)) {
    if (as.integer(debug) == 0) {
        debug = NULL;
    }
}

# start app services
Tcp::start(debug.port = debug);