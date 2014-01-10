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
//var ruleBased = fluid.registerNamespace("gpii.matchMaker.ruleBased");

var Client = require('node-rest-client').Client;

fluid.require("./Log.js", require);

var path = require("path");
var when = require("when");
var fs = require('fs');
var $ = fluid.registerNamespace("jQuery");
var gpii = fluid.registerNamespace("gpii");
var http = require('http');
var url = require('url');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

fluid.defaults("gpii.matchMaker.ruleBased", {
     gradeNames: ["autoInit", "fluid.littleComponent"],
     invokers: {
         match: {
             funcName: "gpii.matchMaker.ruleBased.match",
             args: ["{callbackWrapper}", "{arguments}.0", "{arguments}.1", "{arguments}.3", "{arguments}.2"],
			 dynamic: true
         }
     }
 });

fluid.defaults("gpii.matchMaker.ruleBased.matchPost", {
    gradeNames: ["autoInit", "fluid.littleComponent"],
    invokers: {
        match: {
            funcName: "gpii.matchMaker.ruleBased.matchPostMatch",
            args: ["{gpii.matchMaker}", "{that}.when", "{arguments}.0", "{arguments}.1", "{request}.req.body"]
        }
    }
});

gpii.matchMaker.ruleBased.matchPostMatch = function (matchMaker, when, solutions, preferences, originalModel) {
    var transform = matchMaker.transformer.transformSettings,
        strategy = fluid.getGlobalValue(matchMaker.options.strategy);

    when(matchMaker.match(preferences, solutions, strategy, originalModel), function (matchedSolutions) {
        return transform({
            solutions: matchedSolutions,
            preferences: preferences
        });
    });
};

fluid.defaults("kettle.requests.request.handler.matchPostRuleBased", {
    gradeNames: ["autoInit", "fluid.gradeLinkageRecord"],
    contextGrades: ["kettle.requests.request.handler.matchPost"],
    resultGrades: ["gpii.matchMaker.ruleBased.matchPost"]
});

//ruleBased.match = function (callbackWrapper, preferences, solutions, originalModel, strategy) {
gpii.matchMaker.ruleBased.match = function (callbackWrapper, preferences, solutions, originalModel, strategy) {
    "use strict";

    fluid.log("RULE BASED MATCH MAKER MATCH IS USED");						
	//fluid.log("preferences: ");
	//fluid.log(preferences);
	//fluid.log("\n\n\n\nsolutions: ");
	//fluid.log(solutions);
	//fluid.log("\n\n\n\n");
	//fluid.log("originalModel: ");
	//fluid.log(originalModel);

	// Logging
	//gpii.matchMaker.log.inAutoFile(preferences, "RuleMM_ante");

    var inverseTransformations = JSON.parse(fs.readFileSync(path.resolve(__dirname, "inverseRules.json"), "utf8"));
    fluid.each(preferences.applications, function (val, id) {
		var trans = inverseTransformations[id];
		if (trans !== undefined) {
			var new_pref = fluid.model.transformWithRules(val.parameters, trans);
			console.log(JSON.stringify(new_pref));
			$.extend(true, preferences, new_pref);
		}
    });

	return when(CALL_RB_MM(preferences, originalModel.preferences, originalModel.device, solutions, callbackWrapper.wrap), function () {
		// Logging
		//gpii.matchMaker.log.inAutoFile(preferences, "RuleMM_intermediate");

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

function CALL_RB_MM (preferences, originalPreferences, device, solutions, wrap) {
	"use strict";

	var deferred = when.defer(),
        resolver = deferred.resolver,
        promise = deferred.promise;
	
	gpii.matchMaker.log.inAutoFile(preferences, "preferences_BEFORE");
	gpii.matchMaker.log.inAutoFile(solutions, "solutions_BEFORE");
		
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
	
	//find for which applications user has specific preferences and also find preferences defined using common terms
	var tmpSpecificPreferencesForSolutions_IDs = "";
	var tmpCommonTerms = "";
	if(originalPreferences != null)
	{
		//COMMON PREFERENCES
		//speechRate
		if(originalPreferences["http://registry.gpii.org/common/speechRate"] != null
			&& originalPreferences["http://registry.gpii.org/common/speechRate"][0] != null
			&& originalPreferences["http://registry.gpii.org/common/speechRate"][0].value != null)
		{
			tmpCommonTerms = tmpCommonTerms + "display.screenReader.speechRate*";
			tmpCommonTerms = tmpCommonTerms + originalPreferences["http://registry.gpii.org/common/speechRate"][0].value + "*";
		}		
		//trackingTTS
		if(originalPreferences["http://registry.gpii.org/common/trackingTTS"] != null
			&& originalPreferences["http://registry.gpii.org/common/trackingTTS"][0] != null
			&& originalPreferences["http://registry.gpii.org/common/trackingTTS"][0].value != null)
		{
			tmpCommonTerms = tmpCommonTerms + "display.screenEnhancement.trackingTTS*";
			tmpCommonTerms = tmpCommonTerms + originalPreferences["http://registry.gpii.org/common/trackingTTS"][0].value + "*";
		}
		//speakTutorialMessages
		if(originalPreferences["http://registry.gpii.org/common/speakTutorialMessages"] != null
			&& originalPreferences["http://registry.gpii.org/common/speakTutorialMessages"][0] != null
			&& originalPreferences["http://registry.gpii.org/common/speakTutorialMessages"][0].value != null)
		{
			tmpCommonTerms = tmpCommonTerms + "display.screenReader.-provisional-speakTutorialMessages*";
			tmpCommonTerms = tmpCommonTerms + originalPreferences["http://registry.gpii.org/common/speakTutorialMessages"][0].value + "*";
		}
		//keyEcho
		if(originalPreferences["http://registry.gpii.org/common/keyEcho"] != null
			&& originalPreferences["http://registry.gpii.org/common/keyEcho"][0] != null
			&& originalPreferences["http://registry.gpii.org/common/keyEcho"][0].value != null)
		{
			tmpCommonTerms = tmpCommonTerms + "display.screenReader.-provisional-keyEcho*";
			tmpCommonTerms = tmpCommonTerms + originalPreferences["http://registry.gpii.org/common/keyEcho"][0].value + "*";
		}
		//wordEcho
		if(originalPreferences["http://registry.gpii.org/common/wordEcho"] != null
			&& originalPreferences["http://registry.gpii.org/common/wordEcho"][0] != null
			&& originalPreferences["http://registry.gpii.org/common/wordEcho"][0].value != null)
		{
			tmpCommonTerms = tmpCommonTerms + "display.screenReader.-provisional-wordEcho*";
			tmpCommonTerms = tmpCommonTerms + originalPreferences["http://registry.gpii.org/common/wordEcho"][0].value + "*";
		}
		//announceCapitals
		if(originalPreferences["http://registry.gpii.org/common/announceCapitals"] != null
			&& originalPreferences["http://registry.gpii.org/common/announceCapitals"][0] != null
			&& originalPreferences["http://registry.gpii.org/common/announceCapitals"][0].value != null)
		{
			tmpCommonTerms = tmpCommonTerms + "display.screenReader.-provisional-announceCapitals*";
			tmpCommonTerms = tmpCommonTerms + originalPreferences["http://registry.gpii.org/common/announceCapitals"][0].value + "*";
		}
		//screenReaderBrailleOutput
		if(originalPreferences["http://registry.gpii.org/common/screenReaderBrailleOutput"] != null
			&& originalPreferences["http://registry.gpii.org/common/screenReaderBrailleOutput"][0] != null
			&& originalPreferences["http://registry.gpii.org/common/screenReaderBrailleOutput"][0].value != null)
		{
			tmpCommonTerms = tmpCommonTerms + "display.screenReader.-provisional-screenReaderBrailleOutput*";
			tmpCommonTerms = tmpCommonTerms + originalPreferences["http://registry.gpii.org/common/screenReaderBrailleOutput"][0].value + "*";
		}
		//punctuationVerbosity
		if(originalPreferences["http://registry.gpii.org/common/punctuationVerbosity"] != null
			&& originalPreferences["http://registry.gpii.org/common/punctuationVerbosity"][0] != null
			&& originalPreferences["http://registry.gpii.org/common/punctuationVerbosity"][0].value != null)
		{
			tmpCommonTerms = tmpCommonTerms + "display.screenReader.-provisional-punctuationVerbosity*";
			tmpCommonTerms = tmpCommonTerms + originalPreferences["http://registry.gpii.org/common/punctuationVerbosity"][0].value + "*";
		}
		//readingUnit
		if(originalPreferences["http://registry.gpii.org/common/readingUnit"] != null
			&& originalPreferences["http://registry.gpii.org/common/readingUnit"][0] != null
			&& originalPreferences["http://registry.gpii.org/common/readingUnit"][0].value != null)
		{
			tmpCommonTerms = tmpCommonTerms + "display.textReadingHighlight.readingUnit*";
			tmpCommonTerms = tmpCommonTerms + originalPreferences["http://registry.gpii.org/common/readingUnit"][0].value + "*";
		}
		//auditoryOutLanguage
		if(originalPreferences["http://registry.gpii.org/common/auditoryOutLanguage"] != null
			&& originalPreferences["http://registry.gpii.org/common/auditoryOutLanguage"][0] != null
			&& originalPreferences["http://registry.gpii.org/common/auditoryOutLanguage"][0].value != null)
		{
			tmpCommonTerms = tmpCommonTerms + "display.screenReader.-provisional-auditoryOutLanguage*";
			tmpCommonTerms = tmpCommonTerms + originalPreferences["http://registry.gpii.org/common/auditoryOutLanguage"][0].value + "*";
		}
		//screenReaderTTSEnabled
		if(originalPreferences["http://registry.gpii.org/common/screenReaderTTSEnabled"] != null
			&& originalPreferences["http://registry.gpii.org/common/screenReaderTTSEnabled"][0] != null
			&& originalPreferences["http://registry.gpii.org/common/screenReaderTTSEnabled"][0].value != null)
		{
			tmpCommonTerms = tmpCommonTerms + "display.screenReader.-provisional-screenReaderTTSEnabled*";
			tmpCommonTerms = tmpCommonTerms + originalPreferences["http://registry.gpii.org/common/screenReaderTTSEnabled"][0].value + "*";
		}
		//pitch
		if(originalPreferences["http://registry.gpii.org/common/pitch"] != null
			&& originalPreferences["http://registry.gpii.org/common/pitch"][0] != null
			&& originalPreferences["http://registry.gpii.org/common/pitch"][0].value != null)
		{
			tmpCommonTerms = tmpCommonTerms + "pitch*";
			tmpCommonTerms = tmpCommonTerms + originalPreferences["http://registry.gpii.org/common/pitch"][0].value + "*";
		}
		//volumeTTS
		/*if(originalPreferences["http://registry.gpii.org/common/volumeTTS"] != null
			&& originalPreferences["http://registry.gpii.org/common/volumeTTS"][0] != null
			&& originalPreferences["http://registry.gpii.org/common/volumeTTS"][0].value != null)
		{
			tmpCommonTerms = tmpCommonTerms + "display.screenReader.volumeTTS*";
			tmpCommonTerms = tmpCommonTerms + originalPreferences["http://registry.gpii.org/common/volumeTTS"][0].value + "*";
		}*/
		
		//display.screenEnhancement.-provisional-magnifierEnabled
		if(originalPreferences["http://registry.gpii.org/common/magnifierEnabled"] != null
			&& originalPreferences["http://registry.gpii.org/common/magnifierEnabled"][0] != null
			&& originalPreferences["http://registry.gpii.org/common/magnifierEnabled"][0].value != null)
		{
			tmpCommonTerms = tmpCommonTerms + "display.screenEnhancement.-provisional-magnifierEnabled*";
			tmpCommonTerms = tmpCommonTerms + originalPreferences["http://registry.gpii.org/common/magnifierEnabled"][0].value + "*";
		}
		//display.screenEnhancement.magnification
		if(originalPreferences["http://registry.gpii.org/common/magnification"] != null
			&& originalPreferences["http://registry.gpii.org/common/magnification"][0] != null
			&& originalPreferences["http://registry.gpii.org/common/magnification"][0].value != null)
		{
			tmpCommonTerms = tmpCommonTerms + "display.screenEnhancement.magnification*";
			tmpCommonTerms = tmpCommonTerms + originalPreferences["http://registry.gpii.org/common/magnification"][0].value + "*";
		}
		//display.screenEnhancement.tracking
		if(originalPreferences["http://registry.gpii.org/common/tracking"] != null
			&& originalPreferences["http://registry.gpii.org/common/tracking"][0] != null
			&& originalPreferences["http://registry.gpii.org/common/tracking"][0].value != null)
		{
			tmpCommonTerms = tmpCommonTerms + "display.screenEnhancement.tracking*";
			tmpCommonTerms = tmpCommonTerms + originalPreferences["http://registry.gpii.org/common/tracking"][0].value + "*";
		}
		//display.screenEnhancement.-provisional-magnifierPosition
		if(originalPreferences["http://registry.gpii.org/common/magnifierPosition"] != null
			&& originalPreferences["http://registry.gpii.org/common/magnifierPosition"][0] != null
			&& originalPreferences["http://registry.gpii.org/common/magnifierPosition"][0].value != null)
		{
			tmpCommonTerms = tmpCommonTerms + "display.screenEnhancement.-provisional-magnifierPosition*";
			tmpCommonTerms = tmpCommonTerms + originalPreferences["http://registry.gpii.org/common/magnifierPosition"][0].value + "*";
		}
		//display.screenEnhancement.-provisional-invertColours
		if(originalPreferences["http://registry.gpii.org/common/invertColours"] != null
			&& originalPreferences["http://registry.gpii.org/common/invertColours"][0] != null
			&& originalPreferences["http://registry.gpii.org/common/invertColours"][0].value != null)
		{
			tmpCommonTerms = tmpCommonTerms + "display.screenEnhancement.-provisional-invertColours*";
			tmpCommonTerms = tmpCommonTerms + originalPreferences["http://registry.gpii.org/common/invertColours"][0].value + "*";
		}
		//display.screenEnhancement.-provisional-showCrosshairs
		if(originalPreferences["http://registry.gpii.org/common/showCrosshairs"] != null
			&& originalPreferences["http://registry.gpii.org/common/showCrosshairs"][0] != null
			&& originalPreferences["http://registry.gpii.org/common/showCrosshairs"][0].value != null)
		{
			tmpCommonTerms = tmpCommonTerms + "display.screenEnhancement.-provisional-showCrosshairs*";
			tmpCommonTerms = tmpCommonTerms + originalPreferences["http://registry.gpii.org/common/showCrosshairs"][0].value + "*";
		}
		//display.screenEnhancement.-provisional-highContrastTheme
		if(originalPreferences["http://registry.gpii.org/common/highContrastTheme"] != null
			&& originalPreferences["http://registry.gpii.org/common/highContrastTheme"][0] != null
			&& originalPreferences["http://registry.gpii.org/common/highContrastTheme"][0].value != null)
		{
			tmpCommonTerms = tmpCommonTerms + "display.screenEnhancement.-provisional-highContrastTheme*";
			tmpCommonTerms = tmpCommonTerms + originalPreferences["http://registry.gpii.org/common/highContrastTheme"][0].value + "*";
		}
		//display.screenEnhancement.-provisional-highContrastEnabled
		if(originalPreferences["http://registry.gpii.org/common/highContrastEnabled"] != null
			&& originalPreferences["http://registry.gpii.org/common/highContrastEnabled"][0] != null
			&& originalPreferences["http://registry.gpii.org/common/highContrastEnabled"][0].value != null)
		{
			tmpCommonTerms = tmpCommonTerms + "display.screenEnhancement.-provisional-highContrastEnabled*";
			tmpCommonTerms = tmpCommonTerms + originalPreferences["http://registry.gpii.org/common/highContrastEnabled"][0].value + "*";
		}

		
		//APPLICATION-SPECIFIC PREFERENCES
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
			if(appName === "http://registry.gpii.org/applications/org.nvda-project")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "org.nvda-project ";
		    if(appName === "http://registry.gpii.org/applications/org.chrome.cloud4chrome")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "org.chrome.cloud4chrome ";
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
			if(appName === "http://registry.gpii.org/applications/com.yourdolphin.supernova-as")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "com.yourdolphin.supernova-as ";				
			//DUMMY APPs
			if(appName === "http://registry.gpii.org/applications/ISO24751.screenReader")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "ISO24751.screenReader "; 	
			if(appName === "http://registry.gpii.org/applications/jaws.screenReader")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "jaws.screenReader ";
			if(appName === "http://registry.gpii.org/applications/com.serotek.satogo")
				tmpSpecificPreferencesForSolutions_IDs = tmpSpecificPreferencesForSolutions_IDs + "com.serotek.satogo ";
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
	
	var userPreferences = tmpFontSize + "|" + tmpMagnification + "|" + tmpForegroundColor + "|" + tmpBackgroundColor + "|" + highContrast + "|" + magnifierFullScreen + "|" + tmpSpecificPreferencesForSolutions_IDs + "|" + tmpCommonTerms;
	userPreferences = userPreferences.split(" ").join("%20");
	
	//ENVIRONMENT
	
	var tmpInstalledSolutionsIDs = "";
	if(device.solutions != null)
	{
		for (var i=0; i<device.solutions.length; i++)
		{
			
			var tmpSolutionID = device.solutions[i].id;
			
			//solutions currently supported inside the solutions ontology - In the future this "if" block has to be removed, as all solutions should be supported inside the solutions ontology
			if(tmpSolutionID == 'org.gnome.desktop.a11y.magnifier'
				|| tmpSolutionID == 'ISO24751.screenMagnifier'
				|| tmpSolutionID == 'com.microsoft.windows.magnifier'
				|| tmpSolutionID == 'ZoomText.screenMagnifier'
				|| tmpSolutionID == 'ISO24751.screenReader'
				|| tmpSolutionID == 'jaws.screenReader'
				|| tmpSolutionID == 'org.nvda-project'
				|| tmpSolutionID == 'org.chrome.cloud4chrome'
				|| tmpSolutionID == 'org.gnome.orca'
				|| tmpSolutionID == 'com.serotek.satogo'
				|| tmpSolutionID == 'com.android.talkback'
				|| tmpSolutionID == 'webinsight.webAnywhere.windows'
				|| tmpSolutionID == 'webinsight.webAnywhere.linux'
				|| tmpSolutionID == 'com.yourdolphin.supernova-as'
				|| tmpSolutionID == 'Win7BuiltInNarrator.screenReader')
			{
				tmpInstalledSolutionsIDs = tmpInstalledSolutionsIDs.concat(tmpSolutionID);
				tmpInstalledSolutionsIDs = tmpInstalledSolutionsIDs.concat(" ");
			}
			
		}				
	}
	//in the future, the following variable won't be hard-coded
	//NOTE: currenty in the RESTful WS the "tmpAvailableSolutionsIDs" IS IGNORED! available==installed
	var tmpAvailableSolutionsIDs = "com.yourdolphin.supernova-as org.chrome.cloud4chrome org.nvda-project org.gnome.orca ISO24751.screenReader jaws.screenReader com.serotek.satogo webanywhere.screenReader Win7BuiltInNarrator.screenReader ISO24751.screenMagnifier LinuxBuiltIn.screenMagnifier WindowsBuiltIn.screenMagnifier ZoomText.screenMagnifier";		

	var environment = device.OS.id + "|" + device.OS.version + "|" + tmpInstalledSolutionsIDs + "|" + tmpAvailableSolutionsIDs;
	environment = environment.split(" ").join("%20");
	
	// CALL THE RBMM WEB-SERVICE
	var feedbackEnglishFileURL = "";
	var feedbackGermanFileURL = "";
	var feedbackGreekFileURL = "";
	var feedbackSpanishFileURL = "";

	var client = new Client();
	
	//KANONIKOS SERVER 
	//var tomcat_ws_URL_prefix = "http://160.40.50.183:9090";	//Apache Tomcat
	//var tomcat_html_URL_prefix = "http://160.40.50.183";		//xampp
	
	//BACKUP PLAN!
	var tomcat_ws_URL_prefix = "http://localhost:8080";	//Apache Tomcat
	//var tomcat_html_URL_prefix = "http://160.40.50.183";		//xampp - WE WON'T SHOW HTML FEEDBACK!
	
	//Apache-Tomcat se OS X (dynamic IP) for testing...
	//var tomcat_ws_URL_prefix = "http://192.168.1.5:8080";		//Apache Tomcat
	//var tomcat_html_URL_prefix = "http://192.168.1.5";			//xampp
	
	var wsPath = tomcat_ws_URL_prefix + "/CLOUD4All_RBMM_Restful_WS/RBMM/runRules/" + userPreferences + "/" + environment;
	
	client.get(wsPath, wrap(function(data, response){
            // parsed response body as js object
            //fluid.log(data);
            // raw response
            //fluid.log(response);
			
			RULES_RESULT = data;
			
			fluid.log("****************");
			fluid.log("* RULES_RESULT *");
			fluid.log("****************");
			fluid.log(RULES_RESULT);
			
			//fluid.log("\n\n\n\nsolutions BEFORE EXCLUDING: ");
			//fluid.log(solutions);
			//fluid.log("\n\n\n\npreferences BEFORE EXCLUDING: ");
			//fluid.log(preferences);
			
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
				else if(newPrefsWords[i] === "OPEN_VOLUME")
				{
					if(preferences!=null && preferences.applications!=null && preferences.applications["org.alsa-project"]==null)
						preferences.applications["org.alsa-project"] = { id: "org.alsa-project", parameters: { masterVolume: 20 } };
				}
				else if(newPrefsWords[i] === "ANDROID_INCREASE_FONT_SIZE")
				{
					if(preferences!=null && preferences.applications!=null && preferences.applications["com.android.persistentConfiguration"]==null)
						preferences.applications["com.android.persistentConfiguration"] = { id: "com.android.persistentConfiguration", parameters: { fontScale: 1.5, locale: "en" } };
					//preferences.display.screenEnhancement.fontSize = 24;
				}
				
				///////////////////////////////
				//APPLICATIONS TO BE LAUNCHED//
				///////////////////////////////
				else if(newPrefsWords[i] === "LAUNCH_GNOME_MAGNIFIER")
				{
					if(preferences!=null && preferences.applications!=null && preferences.applications["org.gnome.desktop.a11y.magnifier"]==null)
						preferences.applications["org.gnome.desktop.a11y.magnifier"] = { id: "org.gnome.desktop.a11y.magnifier", parameters: true };
				}
				else if(newPrefsWords[i] === "LAUNCH_ISO24751_MAGNIFIER")
				{
					if(preferences!=null && preferences.applications!=null && preferences.applications["ISO24751.screenMagnifier"]==null)
						preferences.applications["ISO24751.screenMagnifier"] = { id: "ISO24751.screenMagnifier", parameters: true };
				}
				else if(newPrefsWords[i] === "LAUNCH_WINDOWS_MAGNIFIER")
				{
					if(preferences!=null && preferences.applications!=null && preferences.applications["com.microsoft.windows.magnifier"]==null)
						preferences.applications["com.microsoft.windows.magnifier"] = { id: "com.microsoft.windows.magnifier", parameters: true };
				}
				else if(newPrefsWords[i] === "LAUNCH_ZOOMTEXT_MAGNIFIER")
				{
					if(preferences!=null && preferences.applications!=null && preferences.applications["ZoomText.screenMagnifier"]==null)
						preferences.applications["ZoomText.screenMagnifier"] = { id: "ZoomText.screenMagnifier", parameters: true };
				}
				else if(newPrefsWords[i] === "LAUNCH_ISO24751_SCREENREADER")
				{
					if(preferences!=null && preferences.applications!=null && preferences.applications["ISO24751.screenReader"]==null)
						preferences.applications["ISO24751.screenReader"] = { id: "ISO24751.screenReader", parameters: true };
				}
				else if(newPrefsWords[i] === "LAUNCH_JAWS_SCREENREADER")
				{
					if(preferences!=null && preferences.applications!=null && preferences.applications["jaws.screenReader"]==null)
						preferences.applications["jaws.screenReader"] = { id: "jaws.screenReader", parameters: true };
				}
				else if(newPrefsWords[i] === "LAUNCH_NVDA_SCREENREADER")
				{
					if(preferences!=null && preferences.applications!=null && preferences.applications["org.nvda-project"]==null)
						preferences.applications["org.nvda-project"] = { id: "org.nvda-project", parameters: true };
				}
				else if(newPrefsWords[i] === "LAUNCH_CLOUD4CHROME")
				{
					if(preferences!=null && preferences.applications!=null && preferences.applications["org.chrome.cloud4chrome"]==null)
						preferences.applications["org.chrome.cloud4chrome"] = { id: "org.chrome.cloud4chrome", parameters: true };
				}
				else if(newPrefsWords[i] === "LAUNCH_ORCA_SCREENREADER")
				{
					if(preferences!=null && preferences.applications!=null && preferences.applications["org.gnome.orca"]==null)
						preferences.applications["org.gnome.orca"] = { id: "org.gnome.orca", parameters: true };
				}
				else if(newPrefsWords[i] === "LAUNCH_SATOGO_SCREENREADER")
				{
					if(preferences!=null && preferences.applications!=null && preferences.applications["com.serotek.satogo"]==null)
						preferences.applications["com.serotek.satogo"] = { id: "com.serotek.satogo", parameters: true };
				}
				else if(newPrefsWords[i] === "LAUNCH_TALKBACK_SCREENREADER")
				{
					if(preferences!=null && preferences.applications!=null && preferences.applications["com.android.talkback"]==null)
						preferences.applications["com.android.talkback"] = { id: "com.android.talkback", parameters: true };
				}
				else if(newPrefsWords[i] === "LAUNCH_WEBANYWHERE_WINDOWS_SCREENREADER")
				{
					if(preferences!=null && preferences.applications!=null && preferences.applications["webinsight.webAnywhere.windows"]==null)
						preferences.applications["webinsight.webAnywhere.windows"] = { id: "webinsight.webAnywhere.windows", parameters: true };
				}
				else if(newPrefsWords[i] === "LAUNCH_WEBANYWHERE_LINUX_SCREENREADER")
				{
					if(preferences!=null && preferences.applications!=null && preferences.applications["webinsight.webAnywhere.linux"]==null)
						preferences.applications["webinsight.webAnywhere.linux"] = { id: "webinsight.webAnywhere.linux", parameters: true };
				}
				else if(newPrefsWords[i] === "LAUNCH_WIN7BUILTINNARRATOR_SCREENREADER")
				{
					if(preferences!=null && preferences.applications!=null && preferences.applications["Win7BuiltInNarrator.screenReader"]==null)
						preferences.applications["Win7BuiltInNarrator.screenReader"] = { id: "Win7BuiltInNarrator.screenReader", parameters: true };
				}
				else if(newPrefsWords[i] === "LAUNCH_SUPERNOVA")
				{
					if(preferences!=null && preferences.applications!=null && preferences.applications["com.yourdolphin.supernova-as"]==null)
						preferences.applications["com.yourdolphin.supernova-as"] = { id: "com.yourdolphin.supernova-as", parameters: true };
				}
				
				//////////////////////////////////////////////
				//APPLICATIONS TO BE EXCLUDED FROM EXECUTION//
				//////////////////////////////////////////////
				else if(newPrefsWords[i] === "EXCLUDE_GNOME_MAGNIFIER")
				{
					var indexOfSolutionToBeExlcuded = -1;
					for(var solutionObj in solutions)
					{
						indexOfSolutionToBeExlcuded++;
						if(solutions[solutionObj].id != null &&  solutions[solutionObj].id === "org.gnome.desktop.a11y.magnifier")
							solutions.splice(indexOfSolutionToBeExlcuded, 1);
					}
				}
				else if(newPrefsWords[i] === "EXCLUDE_SUPERNOVA")
				{
					var indexOfSolutionToBeExlcuded = -1;
					for(var solutionObj in solutions)
					{
						indexOfSolutionToBeExlcuded++;
						if(solutions[solutionObj].id != null &&  solutions[solutionObj].id === "com.yourdolphin.supernova-as")
							solutions.splice(indexOfSolutionToBeExlcuded, 1);
					}
				}
				else if(newPrefsWords[i] === "EXCLUDE_ISO24751_MAGNIFIER")
				{
					var indexOfSolutionToBeExlcuded = -1;
					for(var solutionObj in solutions)
					{
						indexOfSolutionToBeExlcuded++;
						if(solutions[solutionObj].id != null &&  solutions[solutionObj].id === "ISO24751.screenMagnifier")
							solutions.splice(indexOfSolutionToBeExlcuded, 1);
					}
				}
				else if(newPrefsWords[i] === "EXCLUDE_WINDOWS_MAGNIFIER")
				{
					var indexOfSolutionToBeExlcuded = -1;
					for(var solutionObj in solutions)
					{
						indexOfSolutionToBeExlcuded++;
						if(solutions[solutionObj].id != null &&  solutions[solutionObj].id === "com.microsoft.windows.magnifier")
							solutions.splice(indexOfSolutionToBeExlcuded, 1);
					}
				}
				else if(newPrefsWords[i] === "EXCLUDE_ZOOMTEXT_MAGNIFIER")
				{
					var indexOfSolutionToBeExlcuded = -1;
					for(var solutionObj in solutions)
					{
						indexOfSolutionToBeExlcuded++;
						if(solutions[solutionObj].id != null &&  solutions[solutionObj].id === "ZoomText.screenMagnifier")
							solutions.splice(indexOfSolutionToBeExlcuded, 1);
					}
				}
				else if(newPrefsWords[i] === "EXCLUDE_SUPERNOVA")
				{
					var indexOfSolutionToBeExlcuded = -1;
					for(var solutionObj in solutions)
					{
						indexOfSolutionToBeExlcuded++;
						if(solutions[solutionObj].id != null &&  solutions[solutionObj].id === "com.yourdolphin.supernova-as")
							solutions.splice(indexOfSolutionToBeExlcuded, 1);
					}
				}
				else if(newPrefsWords[i] === "EXCLUDE_ISO24751_SCREENREADER")
				{
					var indexOfSolutionToBeExlcuded = -1;
					for(var solutionObj in solutions)
					{
						indexOfSolutionToBeExlcuded++;
						if(solutions[solutionObj].id != null &&  solutions[solutionObj].id === "ISO24751.screenReader")
							solutions.splice(indexOfSolutionToBeExlcuded, 1);
					}
				}
				else if(newPrefsWords[i] === "EXCLUDE_JAWS_SCREENREADER")
				{
					var indexOfSolutionToBeExlcuded = -1;
					for(var solutionObj in solutions)
					{
						indexOfSolutionToBeExlcuded++;
						if(solutions[solutionObj].id != null &&  solutions[solutionObj].id === "jaws.screenReader")
							solutions.splice(indexOfSolutionToBeExlcuded, 1);
					}
				}
				else if(newPrefsWords[i] === "EXCLUDE_NVDA_SCREENREADER")
				{
					var indexOfSolutionToBeExlcuded = -1;
					for(var solutionObj in solutions)
					{
						indexOfSolutionToBeExlcuded++;
						if(solutions[solutionObj].id != null &&  solutions[solutionObj].id === "org.nvda-project")
							solutions.splice(indexOfSolutionToBeExlcuded, 1);
					}
				}
				else if(newPrefsWords[i] === "EXCLUDE_CLOUD4CHROME")
				{
					var indexOfSolutionToBeExlcuded = -1;
					for(var solutionObj in solutions)
					{
						indexOfSolutionToBeExlcuded++;
						if(solutions[solutionObj].id != null &&  solutions[solutionObj].id === "org.chrome.cloud4chrome")
							solutions.splice(indexOfSolutionToBeExlcuded, 1);
					}
				}
				else if(newPrefsWords[i] === "EXCLUDE_ORCA_SCREENREADER")
				{
					var indexOfSolutionToBeExlcuded = -1;
					for(var solutionObj in solutions)
					{
						indexOfSolutionToBeExlcuded++;
						if(solutions[solutionObj].id != null &&  solutions[solutionObj].id === "org.gnome.orca")
							solutions.splice(indexOfSolutionToBeExlcuded, 1);
					}
				}
				else if(newPrefsWords[i] === "EXCLUDE_SATOGO_SCREENREADER")
				{
					var indexOfSolutionToBeExlcuded = -1;
					for(var solutionObj in solutions)
					{
						indexOfSolutionToBeExlcuded++;
						if(solutions[solutionObj].id != null &&  solutions[solutionObj].id === "com.serotek.satogo")
							solutions.splice(indexOfSolutionToBeExlcuded, 1);
					}
				}
				else if(newPrefsWords[i] === "EXCLUDE_TALKBACK_SCREENREADER")
				{
					var indexOfSolutionToBeExlcuded = -1;
					for(var solutionObj in solutions)
					{
						indexOfSolutionToBeExlcuded++;
						if(solutions[solutionObj].id != null &&  solutions[solutionObj].id === "com.android.talkback")
							solutions.splice(indexOfSolutionToBeExlcuded, 1);
					}
				}
				else if(newPrefsWords[i] === "EXCLUDE_WEBANYWHERE_WINDOWS_SCREENREADER")
				{
					var indexOfSolutionToBeExlcuded = -1;
					for(var solutionObj in solutions)
					{
						indexOfSolutionToBeExlcuded++;
						if(solutions[solutionObj].id != null &&  solutions[solutionObj].id === "webinsight.webAnywhere.windows")
							solutions.splice(indexOfSolutionToBeExlcuded, 1);
					}					
				}
				else if(newPrefsWords[i] === "EXCLUDE_WEBANYWHERE_LINUX_SCREENREADER")
				{
					var indexOfSolutionToBeExlcuded = -1;
					for(var solutionObj in solutions)
					{
						indexOfSolutionToBeExlcuded++;
						if(solutions[solutionObj].id != null &&  solutions[solutionObj].id === "webinsight.webAnywhere.linux")
							solutions.splice(indexOfSolutionToBeExlcuded, 1);
					}					
				}
				else if(newPrefsWords[i] === "EXCLUDE_WIN7BUILTINNARRATOR_SCREENREADER")
				{
					var indexOfSolutionToBeExlcuded = -1;
					for(var solutionObj in solutions)
					{
						indexOfSolutionToBeExlcuded++;
						if(solutions[solutionObj].id != null &&  solutions[solutionObj].id === "Win7BuiltInNarrator.screenReader")
							solutions.splice(indexOfSolutionToBeExlcuded, 1);
					}
				}
				//Textual feedback (HTML)
				/*else if(newPrefsWords[i].indexOf(tomcat_html_URL_prefix + "/RBMM/RBMMFeedbackEnglish") != -1)
				{
					feedbackEnglishFileURL = newPrefsWords[i];
				}				
				else if(newPrefsWords[i].indexOf(tomcat_html_URL_prefix + "/RBMM/RBMMFeedbackGerman") != -1)
				{
					feedbackGermanFileURL = newPrefsWords[i];
				}
				else if(newPrefsWords[i].indexOf(tomcat_html_URL_prefix + "/RBMM/RBMMFeedbackGreek") != -1)
				{
					feedbackGreekFileURL = newPrefsWords[i];
				}
				else if(newPrefsWords[i].indexOf(tomcat_html_URL_prefix + "/RBMM/RBMMFeedbackSpanish") != -1)
				{
					feedbackSpanishFileURL = newPrefsWords[i];
				}*/
				
				///////////////////////////////////////////////////////
				// COMMON PREFERENCES TO BE INCLUDED IN USER PROFILE //
				///////////////////////////////////////////////////////
				
				///////////////////////////////
				//APPLICATIONS TO BE LAUNCHED//
				///////////////////////////////
				else if(newPrefsWords[i] === "ADD_COMMON_PREF_SCREENREADER_TTS_ENABLED")
				{
					if(preferences != null && preferences.display != null)
					{
						preferences.display.screenReader["-provisional-screenReaderTTSEnabled"] = true;
					}
					//as described in the scenario: http://issues.gpii.net/browse/GPII-474
					//delete WebAnywhere
					var indexOfSolutionToBeExlcuded = -1;
					for(var solutionObj in solutions)
					{
						indexOfSolutionToBeExlcuded++;
						if(solutions[solutionObj].id != null &&  solutions[solutionObj].id === "webinsight.webAnywhere.linux")
							solutions.splice(indexOfSolutionToBeExlcuded, 1);
					}
					//delete Chrome
					indexOfSolutionToBeExlcuded = -1;
					for(var solutionObj in solutions)
					{
						indexOfSolutionToBeExlcuded++;
						if(solutions[solutionObj].id != null &&  solutions[solutionObj].id === "org.chrome.cloud4chrome")
							solutions.splice(indexOfSolutionToBeExlcuded, 1);
					}
				}
			}
			
			//fluid.log("\n\n\n\nsolutions AFTER EXCLUDING: ");
			//fluid.log(solutions);
			//fluid.log("\n\n\n\npreferences AFTER EXCLUDING: ");
			//fluid.log(preferences);
			
			fluid.log("\nfeedbackEnglishFileURL: ");
			fluid.log(feedbackEnglishFileURL);
			
			// Feedback
			/*var DOWNLOAD_DIR = 'RBMM_Feedback';
			var mkdir = 'mkdir ' + DOWNLOAD_DIR;
			var child = exec(mkdir, function(err, stdout, stderr) {
				download_feedback_file(feedbackEnglishFileURL);
				download_feedback_file(feedbackGermanFileURL);
				download_feedback_file(feedbackGreekFileURL);
				download_feedback_file(feedbackSpanishFileURL);
			});			

			var download_feedback_file = function(file_url) {
				var options = {
					host: url.parse(file_url).host,
					port: 80,
					path: url.parse(file_url).pathname
				};

				var file_name = ""; //url.parse(file_url).pathname.split('/').pop();
				if(file_url === feedbackEnglishFileURL)
					file_name = "English.html";
				else if(file_url === feedbackGermanFileURL)
					file_name = "German.html";
				else if(file_url === feedbackGreekFileURL)
					file_name = "Greek.html";
				else if(file_url === feedbackSpanishFileURL)
					file_name = "Spanish.html";
				var file = fs.createWriteStream('./' + DOWNLOAD_DIR + '/' + file_name);

				http.get(options, function(res) {
					res.on('data', function(data) {
							file.write(data);
						}).on('end', function() {
							file.end();
							//fluid.log(file_name + ' downloaded to ' + DOWNLOAD_DIR);
						});
					});
			};*/
			
			gpii.matchMaker.log.inAutoFile(preferences, "preferences_AFTER");
			gpii.matchMaker.log.inAutoFile(solutions, "solutions_AFTER");
			
			resolver.resolve();
        }));
	
    return promise;
}
