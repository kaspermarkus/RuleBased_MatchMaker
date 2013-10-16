/*!
GPII Rule Based Matchmaker

Copyright 2013 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://github.com/gpii/universal/LICENSE.txt
*/

var RULES_RESULT;

var fluid = fluid || require("universal");

var matchMaker = fluid.registerNamespace("gpii.matchMaker");
var ruleBased = fluid.registerNamespace("gpii.matchMaker.ruleBased");

fluid.require("./Log.js", require);

var path = require("path");
var when = require("when");
var fs = require('fs');
var $ = fluid.registerNamespace("jQuery");
var gpii = fluid.registerNamespace("gpii");
var http = require('http');


ruleBased.match = function (callbackWrapper, preferences, solutions, originalModel, strategy) {
    "use strict";

    fluid.log("RULE BASED MATCH MAKER MATCH IS USED");						
	//fluid.log("preferences: ");
	//fluid.log(preferences);
	//fluid.log("solutions: ");
	//fluid.log(solutions);
	//fluid.log("originalModel: ");
	//fluid.log(originalModel);

	// Logging
	gpii.matchMaker.log.inAutoFile(preferences, "RuleMM_ante");

    var inverseTransformations = JSON.parse(fs.readFileSync(path.resolve(__dirname, "inverseRules.json"), "utf8"));
    fluid.each(preferences.applications, function (val, id) {
		var trans = inverseTransformations[id];
		if (trans !== undefined) {
			var new_pref = fluid.model.transformWithRules(val.parameters, trans);
			console.log(JSON.stringify(new_pref));
			$.extend(true, preferences, new_pref);
		}
    });

	return when(CALL_RB_MM(preferences, originalModel.preferences, originalModel.device, callbackWrapper.wrap), function () {
		// Logging
		gpii.matchMaker.log.inAutoFile(preferences, "RuleMM_intermediate");

        return when(gpii.matchMaker.disposeSolutions(preferences, solutions, strategy), function (disposed) {
            var togo = [];
            fluid.each(disposed, function(solrec) {
                if (solrec.disposition === "accept") {
                    togo.push(solrec.solution);
                }
            });
            return togo;
        });
    });
};

function CALL_RB_MM (preferences, originalPreferences, device, wrap) {
	"use strict";

	var deferred = when.defer(),
        resolver = deferred.resolver,
        promise = deferred.promise;
		
		
	//USER PROFILE	
		
	var highContrast = false;
	if(preferences.display != null && preferences.display.screenEnhancement != null && preferences.display.screenEnhancement.highContrast != null)
	{
		if(preferences.display.screenEnhancement.highContrast === true)
		{
			highContrast = true;
		}
	}
	
	var magnifierFullScreen = false;
	if(preferences.display != null && preferences.display.screenEnhancement != null && preferences.display.screenEnhancement["-provisional-magnifierPosition"] != null)
	{
		if(preferences.display.screenEnhancement["-provisional-magnifierPosition"] === "FullScreen")
		{
			magnifierFullScreen = true;
		}
	}
	var tmpFontSize = -1;
	if(preferences.display != null && preferences.display.screenEnhancement != null && preferences.display.screenEnhancement.fontSize != null)
	{
		tmpFontSize = preferences.display.screenEnhancement.fontSize;
	}
	var tmpMagnification = -1.0;
	if(preferences.display != null && preferences.display.screenEnhancement != null && preferences.display.screenEnhancement.magnification != null)
	{
		tmpMagnification = preferences.display.screenEnhancement.magnification;
	}
	var tmpForegroundColor = "unknown";
	if(preferences.display != null && preferences.display.screenEnhancement != null && preferences.display.screenEnhancement.foregroundColor != null)
	{
		tmpForegroundColor = preferences.display.screenEnhancement.foregroundColor;
	}
	var tmpBackgroundColor = "unknown";
	if(preferences.display != null && preferences.display.screenEnhancement != null && preferences.display.screenEnhancement.backgroundColor != null)
	{
		tmpBackgroundColor = preferences.display.screenEnhancement.backgroundColor;
	}
	
	//find for which applications user has specific preferences
	var tmpSpecificPreferencesForSolutions_IDs = "";
	if(originalPreferences != null)
	{
		for(var appName in originalPreferences)
		{
			if(appName === "http://registry.gpii.org/applications/org.gnome.desktop.interface")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "org.gnome.desktop.interface "; 
			if(appName === "http://registry.gpii.org/applications/org.gnome.nautilus")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "org.gnome.nautilus "; 
			if(appName === "http://registry.gpii.org/applications/org.gnome.desktop.a11y.keyboard")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "org.gnome.desktop.a11y.keyboard "; 
			if(appName === "http://registry.gpii.org/applications/org.gnome.desktop.a11y.caribou-keyboard")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "org.gnome.desktop.a11y.caribou-keyboard "; 
			if(appName === "http://registry.gpii.org/applications/org.gnome.orca")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "org.gnome.orca "; 
			if(appName === "http://registry.gpii.org/applications/org.gnome.desktop.a11y.magnifier")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "org.gnome.desktop.a11y.magnifier "; 
			if(appName === "http://registry.gpii.org/applications/com.microsoft.windows.magnifier")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "com.microsoft.windows.magnifier "; 
			if(appName === "http://registry.gpii.org/applications/com.microsoft.windows.onscreenKeyboard")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "com.microsoft.windows.onscreenKeyboard "; 
			if(appName === "http://registry.gpii.org/applications/nvda.screenReader")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "nvda.screenReader "; 
			if(appName === "http://registry.gpii.org/applications/fluid.uiOptions.windows")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "fluid.uiOptions.windows "; 
			if(appName === "http://registry.gpii.org/applications/fluid.uiOptions.linux")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "fluid.uiOptions.linux "; 
			if(appName === "http://registry.gpii.org/applications/org.gnome.desktop.interface")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "org.gnome.desktop.interface "; 
			if(appName === "http://registry.gpii.org/applications/org.gnome.nautilus")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "org.gnome.nautilus "; 
			if(appName === "http://registry.gpii.org/applications/trace.easyOne.communicator.windows")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "trace.easyOne.communicator.windows "; 
			if(appName === "http://registry.gpii.org/applications/trace.easyOne.communicator.linux")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "trace.easyOne.communicator.linux "; 
			if(appName === "http://registry.gpii.org/applications/trace.easyOne.sudan.windows")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "trace.easyOne.sudan.windows "; 
			if(appName === "http://registry.gpii.org/applications/trace.easyOne.sudan.linux")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "trace.easyOne.sudan.linux "; 
			if(appName === "http://registry.gpii.org/applications/webinsight.webAnywhere.windows")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "webinsight.webAnywhere.windows "; 
			if(appName === "http://registry.gpii.org/applications/webinsight.webAnywhere.linux")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "webinsight.webAnywhere.linux "; 
			if(appName === "http://registry.gpii.org/applications/com.microsoft.windows.highContrast")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "com.microsoft.windows.highContrast "; 
			if(appName === "http://registry.gpii.org/applications/com.microsoft.windows.nonClientMetrics")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "com.microsoft.windows.nonClientMetrics "; 
			if(appName === "http://registry.gpii.org/applications/com.microsoft.windows.mouseTracking")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "com.microsoft.windows.mouseTracking "; 
			if(appName === "http://registry.gpii.org/applications/com.microsoft.windows.cursors")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "com.microsoft.windows.cursors "; 
			//DUMMY APPs
			if(appName === "http://registry.gpii.org/applications/ISO24751.screenReader")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "ISO24751.screenReader "; 	
			if(appName === "http://registry.gpii.org/applications/jaws.screenReader")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "jaws.screenReader ";
			if(appName === "http://registry.gpii.org/applications/satogo.screenReader")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "satogo.screenReader ";
			if(appName === "http://registry.gpii.org/applications/webanywhere.screenReader")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "webanywhere.screenReader ";
			if(appName === "http://registry.gpii.org/applications/Win7BuiltInNarrator.screenReader")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "Win7BuiltInNarrator.screenReader ";
			if(appName === "http://registry.gpii.org/applications/ISO24751.screenMagnifier")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "ISO24751.screenMagnifier ";
			if(appName === "http://registry.gpii.org/applications/LinuxBuiltIn.screenMagnifier")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "LinuxBuiltIn.screenMagnifier ";
			if(appName === "http://registry.gpii.org/applications/WindowsBuiltIn.screenMagnifier")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "WindowsBuiltIn.screenMagnifier ";
			if(appName === "http://registry.gpii.org/applications/ZoomText.screenMagnifier")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "ZoomText.screenMagnifier ";
		}
	}
	
	var userPreferences = tmpFontSize + "|" + tmpMagnification + "|" + tmpForegroundColor + "|" + tmpBackgroundColor + "|" + highContrast + "|" + magnifierFullScreen + "|" + tmpSpecificPreferencesForSolutions_IDs;
	userPreferences = userPreferences.split(" ").join("%20");
	
	//ENVIRONMENT
	
	var tmpInstalledSolutionsIDs = "";
	if(device.solutions != null)
	{
		for (var i=0; i<device.solutions.length; i++)
		{
			
			var tmpSolutionID = device.solutions[i].id;
			
			//solutions currently supported inside the solutions ontology - In the future this "if" block has to be removed, as all solutions should be supported inside the solutions ontology
			if(tmpSolutionID == 'nvda.screenReader'
				|| tmpSolutionID == 'org.gnome.orca'
				|| tmpSolutionID == 'ISO24751.screenReader'
				|| tmpSolutionID == 'jaws.screenReader'
				|| tmpSolutionID == 'satogo.screenReader'
				|| tmpSolutionID == 'webanywhere.screenReader'
				|| tmpSolutionID == 'Win7BuiltInNarrator.screenReader'
				|| tmpSolutionID == 'ISO24751.screenMagnifier'
				|| tmpSolutionID == 'LinuxBuiltIn.screenMagnifier'
				|| tmpSolutionID == 'WindowsBuiltIn.screenMagnifier'
				|| tmpSolutionID == 'ZoomText.screenMagnifier')
			{
				tmpInstalledSolutionsIDs = tmpInstalledSolutionsIDs.concat(tmpSolutionID);
				tmpInstalledSolutionsIDs = tmpInstalledSolutionsIDs.concat(" ");
			}
			
		}				
	}
	//in the future, the following variable won't be hard-coded
	var tmpAvailableSolutionsIDs = "nvda.screenReader org.gnome.orca ISO24751.screenReader jaws.screenReader satogo.screenReader webanywhere.screenReader Win7BuiltInNarrator.screenReader ISO24751.screenMagnifier LinuxBuiltIn.screenMagnifier WindowsBuiltIn.screenMagnifier ZoomText.screenMagnifier";		

	var environment = device.OS.id + "|" + device.OS.version + "|" + tmpInstalledSolutionsIDs + "|" + tmpAvailableSolutionsIDs;
	environment = environment.split(" ").join("%20");
	
	// CALL THE RBMM WEB-SERVICE

	var optionsget = {
		host : '160.40.50.130', // here only the domain name
		// (no http/https !)
		port : 9090,
		path : '/CLOUD4All_RBMM_Restful_WS/RBMM/runRules/' + userPreferences + '/' + environment, // the rest of the url with parameters if needed
		method : 'GET' // do GET
	};
	 
	RULES_RESULT = '';
	 
	// do the GET request
	var reqGet = http.request(optionsget, wrap(function(res) 
	{
		res.on('data', wrap(function(d) {
			//process.stdout.write(d);
			RULES_RESULT += d;
			
			fluid.log("****************");
			fluid.log("* RULES_RESULT *");
			fluid.log("****************");
			fluid.log(RULES_RESULT);
			
			var newPrefsWords=RULES_RESULT.split(" ");
			var i=0;
			for(i=0; i<newPrefsWords.length;i++)
			{
				if(newPrefsWords[i] === "ENABLE_DEFAULT_THEME")
				{
					if(preferences != null && preferences.display != null && preferences.display.screenEnhancement != null)
					{
						preferences.display.screenEnhancement.highContrast = false;
						preferences.display.screenEnhancement["-provisional-magnifierPosition"] = "FullScreen";
					}
					//REMOVE APPLICATION-UNIQUE SETTINGS - WINDOWS
					//if(preferences != null && preferences.applications != null && preferences.applications["com.microsoft.windows.highContrast"] != null)
					//{
					//	delete preferences.applications["com.microsoft.windows.highContrast"];
					//}
					
					//REMOVE APPLICATION-UNIQUE SETTINGS - LINUX							
					//if(preferences != null && preferences.applications != null && preferences.applications["org.gnome.desktop.interface"] != null && preferences.applications["org.gnome.desktop.interface"].parameters != null && preferences.applications["org.gnome.desktop.interface"].parameters["gtk-theme"] != null && preferences.applications["org.gnome.desktop.interface"].parameters["gtk-theme"] == "HighContrast")
					//{
					//	delete preferences.applications["org.gnome.desktop.interface"].parameters["gtk-theme"];
					//}
				}
				else if(newPrefsWords[i] === "ENABLE_MAGNIFIER_WITH_INVERSE_COLOURS")
				{
					if(preferences != null && preferences.display != null && preferences.display.screenEnhancement != null)
					{
						preferences.display.screenEnhancement.invertImages = true;
						if(preferences.display.screenEnhancement.magnification == null)
							preferences.display.screenEnhancement.magnification = 1.0;
					}
					//REMOVE APPLICATION-UNIQUE SETTINGS - WINDOWS
					//if(preferences != null && preferences.applications != null && preferences.applications["com.microsoft.windows.magnifier"] != null && preferences.applications["com.microsoft.windows.magnifier"].parameters != null && preferences.applications["com.microsoft.windows.magnifier"].parameters.MagnificationMode != null)
					//{
					//	delete preferences.applications["com.microsoft.windows.magnifier"].parameters.MagnificationMode;
					//}
					//if(preferences != null && preferences.applications != null && preferences.applications["com.microsoft.windows.magnifier"] != null && preferences.applications["com.microsoft.windows.magnifier"].parameters != null && preferences.applications["com.microsoft.windows.magnifier"].parameters.Invert != null)
					//{
					//	delete preferences.applications["com.microsoft.windows.magnifier"].parameters.Invert;
					//}
					//if(preferences != null && preferences.applications != null && preferences.applications["com.microsoft.windows.magnifier"] != null && preferences.applications["com.microsoft.windows.magnifier"].parameters != null && preferences.applications["com.microsoft.windows.magnifier"].parameters.Magnification != null)
					//{
					//	delete preferences.applications["com.microsoft.windows.magnifier"].parameters.Magnification;
					//}
					
					//REMOVE APPLICATION-UNIQUE SETTINGS - LINUX
					//if(preferences != null && preferences.applications != null && preferences.applications["org.gnome.desktop.a11y.magnifier"] != null && preferences.applications["org.gnome.desktop.a11y.magnifier"].parameters != null && preferences.applications["org.gnome.desktop.a11y.magnifier"].parameters["mag-factor"] != null)							{
					//	delete preferences.applications["org.gnome.desktop.a11y.magnifier"].parameters["mag-factor"];
					//}
					//if(preferences != null && preferences.applications != null && preferences.applications["org.gnome.desktop.a11y.magnifier"] != null && preferences.applications["org.gnome.desktop.a11y.magnifier"].parameters != null && preferences.applications["org.gnome.desktop.a11y.magnifier"].parameters["screen-position"] != null)
					//{
					//	delete preferences.applications["org.gnome.desktop.a11y.magnifier"].parameters["screen-position"];
					//}
				}
			}
			
			resolver.resolve();	
		}));
		
	}));
	
	reqGet.end();
	reqGet.on('error', function(e) {
		console.error("ERROR: ", e);
	});		
		
    return promise;
}
