var colorize = require('colorize');
const yaml = require("js-yaml");
const fs = require("node:fs");

var config: any = null;

export function loadYAML() {
    console.log(colorize.ansify("#green[(FerrumC)] Loading YAML Configuration file."))

    config = yaml.load(fs.readFileSync("./src/config/config.yml", "utf8"));

    console.log(colorize.ansify("#green[(FerruMC)] Loaded YAML Configuration file."))
}

export function getConfig() {
    return config;
}