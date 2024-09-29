var colorize = require("colorize");
const configParser = require("./configParser");

export function init() {
    try {
        console.log(
            colorize.ansify("#green[(FerrumC)] Initialising Parsing Handlers..")
        );
        configParser.loadYAML();
    } catch (e) {
        console.log(
            colorize.ansify(
                `#green[(FerrumC)] #red[An unexpected error occurred when initialising the parsing system: \n${e}]`
            )
        );
    }
}
