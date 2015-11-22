'use strict';

var termcolors = require('termcolors');
termcolors.json = require('./formats/json');
var importScheme = require('./utils/importScheme');
var fs = require("fs")
var del = require("del")
var mkdirp = require("mkdirp")
var dirname = require("path").dirname

var outputDir = './dump_output'

var schemesPath = '../dist/schemes'
var schemesIndex = require(schemesPath+'/index.json');
var schemeMap = {};
for (let scheme of schemesIndex) {
	schemeMap[scheme] = importScheme(require(schemesPath+'/'+scheme+".json"));
}
var types = [ "gnome", "linux" ];

del.sync([outputDir]);

var masterSourceFileContents = "";
for (let scheme in schemeMap) {
	for (let type of types) {
		var fileContents = termcolors[type].export(schemeMap[scheme].colors);
		var extension = "";

		if (type == "linux") {
			extension = ".sh";
		} else if (type == "gnome") {
			extension = ".sh";

			var schemeClean = scheme
				.replace(/\//g, ".")
				.replace(/ /g, ".")
				.replace(/-/g, ".")
				.replace(/\.+/g, ".");
			fileContents = "export PROFILE_NAME=" + schemeClean + "\n" + 
				"export PROFILE_SLUG=" + schemeClean + "\n" + fileContents;

			masterSourceFileContents += "\"./" + schemeClean + extension + "\"\necho -n '.'\n";
		}

		var filePath = outputDir+"/"+type+"/"+schemeClean+extension;

		mkdirp.sync(outputDir);
		mkdirp.sync(outputDir+"/"+type);
		fs.writeFileSync(filePath, fileContents);
		fs.chmodSync(filePath, "0755");
	}	
}

var loadAllPath = outputDir+"/gnome/load-all.sh"
fs.writeFileSync(loadAllPath, masterSourceFileContents);
fs.chmodSync(loadAllPath, "0755");

var resetPath = outputDir+"/gnome/remove-all.sh"
fs.writeFileSync(resetPath, "dconf reset -f /org/gnome/terminal/legacy/profiles:/");
fs.chmodSync(resetPath, "0755");

