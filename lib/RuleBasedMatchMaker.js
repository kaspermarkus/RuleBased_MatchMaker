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
            args: ["{callbackWrapper}", "{arguments}.0", "{arguments}.1", "{request}.req.body", "{arguments}.2"]
        }
    }
});

ruleBased.match = function (callbackWrapper, preferences, solutions, originalModel, strategy) {
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

	return when(CALL_RB_MM(preferences, originalModel.preferences, originalModel.device, solutions, callbackWrapper.wrap), function () {
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

function CALL_RB_MM (preferences, originalPreferences, device, solutions, wrap) {
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
	
	//find for which applications user has specific preferences and also find preferences defined using common terms
	var tmpSpecificPreferencesForSolutions_IDs = "";
	var tmpCommonTerms = "";
	if(originalPreferences != null)
	{
		//COMMON PREFERENCES
		//speechRate
		if(originalPreferences["http://registry.gpii.net/common/speechRate"] != null
			&& originalPreferences["http://registry.gpii.net/common/speechRate"][0] != null
			&& originalPreferences["http://registry.gpii.net/common/speechRate"][0].value != null)
		{
			tmpCommonTerms = tmpCommonTerms + "display.screenReader.speechRate*";
			tmpCommonTerms = tmpCommonTerms + originalPreferences["http://registry.gpii.net/common/speechRate"][0].value + "*";
		}		
		//trackingTTS
		if(originalPreferences["http://registry.gpii.net/common/trackingTTS"] != null
			&& originalPreferences["http://registry.gpii.net/common/trackingTTS"][0] != null
			&& originalPreferences["http://registry.gpii.net/common/trackingTTS"][0].value != null)
		{
			tmpCommonTerms = tmpCommonTerms + "display.screenEnhancement.trackingTTS*";
			tmpCommonTerms = tmpCommonTerms + originalPreferences["http://registry.gpii.net/common/trackingTTS"][0].value + "*";
		}
		//speakTutorialMessages
		if(originalPreferences["http://registry.gpii.net/common/speakTutorialMessages"] != null
			&& originalPreferences["http://registry.gpii.net/common/speakTutorialMessages"][0] != null
			&& originalPreferences["http://registry.gpii.net/common/speakTutorialMessages"][0].value != null)
		{
			tmpCommonTerms = tmpCommonTerms + "display.screenReader.-provisional-speakTutorialMessages*";
			tmpCommonTerms = tmpCommonTerms + originalPreferences["http://registry.gpii.net/common/speakTutorialMessages"][0].value + "*";
		}
		//keyEcho
		if(originalPreferences["http://registry.gpii.net/common/keyEcho"] != null
			&& originalPreferences["http://registry.gpii.net/common/keyEcho"][0] != null
			&& originalPreferences["http://registry.gpii.net/common/keyEcho"][0].value != null)
		{
			tmpCommonTerms = tmpCommonTerms + "display.screenReader.-provisional-keyEcho*";
			tmpCommonTerms = tmpCommonTerms + originalPreferences["http://registry.gpii.net/common/keyEcho"][0].value + "*";
		}
		//wordEcho
		if(originalPreferences["http://registry.gpii.net/common/wordEcho"] != null
			&& originalPreferences["http://registry.gpii.net/common/wordEcho"][0] != null
			&& originalPreferences["http://registry.gpii.net/common/wordEcho"][0].value != null)
		{
			tmpCommonTerms = tmpCommonTerms + "display.screenReader.-provisional-wordEcho*";
			tmpCommonTerms = tmpCommonTerms + originalPreferences["http://registry.gpii.net/common/wordEcho"][0].value + "*";
		}
		//announceCapitals
		if(originalPreferences["http://registry.gpii.net/common/announceCapitals"] != null
			&& originalPreferences["http://registry.gpii.net/common/announceCapitals"][0] != null
			&& originalPreferences["http://registry.gpii.net/common/announceCapitals"][0].value != null)
		{
			tmpCommonTerms = tmpCommonTerms + "display.screenReader.-provisional-announceCapitals*";
			tmpCommonTerms = tmpCommonTerms + originalPreferences["http://registry.gpii.net/common/announceCapitals"][0].value + "*";
		}
		//screenReaderBrailleOutput
		if(originalPreferences["http://registry.gpii.net/common/screenReaderBrailleOutput"] != null
			&& originalPreferences["http://registry.gpii.net/common/screenReaderBrailleOutput"][0] != null
			&& originalPreferences["http://registry.gpii.net/common/screenReaderBrailleOutput"][0].value != null)
		{
			tmpCommonTerms = tmpCommonTerms + "display.screenReader.-provisional-screenReaderBrailleOutput*";
			tmpCommonTerms = tmpCommonTerms + originalPreferences["http://registry.gpii.net/common/screenReaderBrailleOutput"][0].value + "*";
		}
		//punctuationVerbosity
		if(originalPreferences["http://registry.gpii.net/common/punctuationVerbosity"] != null
			&& originalPreferences["http://registry.gpii.net/common/punctuationVerbosity"][0] != null
			&& originalPreferences["http://registry.gpii.net/common/punctuationVerbosity"][0].value != null)
		{
			tmpCommonTerms = tmpCommonTerms + "display.screenReader.-provisional-punctuationVerbosity*";
			tmpCommonTerms = tmpCommonTerms + originalPreferences["http://registry.gpii.net/common/punctuationVerbosity"][0].value + "*";
		}
		//readingUnit
		if(originalPreferences["http://registry.gpii.net/common/readingUnit"] != null
			&& originalPreferences["http://registry.gpii.net/common/readingUnit"][0] != null
			&& originalPreferences["http://registry.gpii.net/common/readingUnit"][0].value != null)
		{
			tmpCommonTerms = tmpCommonTerms + "display.textReadingHighlight.readingUnit*";
			tmpCommonTerms = tmpCommonTerms + originalPreferences["http://registry.gpii.net/common/readingUnit"][0].value + "*";
		}
		//auditoryOutLanguage
		if(originalPreferences["http://registry.gpii.net/common/auditoryOutLanguage"] != null
			&& originalPreferences["http://registry.gpii.net/common/auditoryOutLanguage"][0] != null
			&& originalPreferences["http://registry.gpii.net/common/auditoryOutLanguage"][0].value != null)
		{
			tmpCommonTerms = tmpCommonTerms + "display.screenReader.-provisional-auditoryOutLanguage*";
			tmpCommonTerms = tmpCommonTerms + originalPreferences["http://registry.gpii.net/common/auditoryOutLanguage"][0].value + "*";
		}
		//screenReaderTTSEnabled
		if(originalPreferences["http://registry.gpii.net/common/screenReaderTTSEnabled"] != null
			&& originalPreferences["http://registry.gpii.net/common/screenReaderTTSEnabled"][0] != null
			&& originalPreferences["http://registry.gpii.net/common/screenReaderTTSEnabled"][0].value != null)
		{
			tmpCommonTerms = tmpCommonTerms + "display.screenReader.-provisional-screenReaderTTSEnabled*";
			tmpCommonTerms = tmpCommonTerms + originalPreferences["http://registry.gpii.net/common/screenReaderTTSEnabled"][0].value + "*";
		}
		//pitch
		if(originalPreferences["http://registry.gpii.net/common/pitch"] != null
			&& originalPreferences["http://registry.gpii.net/common/pitch"][0] != null
			&& originalPreferences["http://registry.gpii.net/common/pitch"][0].value != null)
		{
			tmpCommonTerms = tmpCommonTerms + "pitch*";
			tmpCommonTerms = tmpCommonTerms + originalPreferences["http://registry.gpii.net/common/pitch"][0].value + "*";
		}
		//volumeTTS
		/*if(originalPreferences["http://registry.gpii.net/common/volumeTTS"] != null
			&& originalPreferences["http://registry.gpii.net/common/volumeTTS"][0] != null
			&& originalPreferences["http://registry.gpii.net/common/volumeTTS"][0].value != null)
		{
			tmpCommonTerms = tmpCommonTerms + "display.screenReader.volumeTTS*";
			tmpCommonTerms = tmpCommonTerms + originalPreferences["http://registry.gpii.net/common/volumeTTS"][0].value + "*";
		}*/
		
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
				|| tmpSolutionID == 'nvda.screenReader'
				|| tmpSolutionID == 'org.gnome.orca'
				|| tmpSolutionID == 'satogo.screenReader'
				|| tmpSolutionID == 'com.android.talkback'
				|| tmpSolutionID == 'webinsight.webAnywhere.windows'
				|| tmpSolutionID == 'Win7BuiltInNarrator.screenReader')
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
	var feedbackEnglishFileURL = "";
	var feedbackGermanFileURL = "";
	var feedbackGreekFileURL = "";
	var feedbackSpanishFileURL = "";

	var client = new Client();
	var wsPath = "http://160.40.50.183:9090/CLOUD4All_RBMM_Restful_WS/RBMM/runRules/" + userPreferences + "/" + environment;
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
					if(preferences!=null && preferences.applications!=null && preferences.applications["nvda.screenReader"]==null)
						preferences.applications["nvda.screenReader"] = { id: "nvda.screenReader", parameters: true };
				}
				else if(newPrefsWords[i] === "LAUNCH_ORCA_SCREENREADER")
				{
					if(preferences!=null && preferences.applications!=null && preferences.applications["org.gnome.orca"]==null)
						preferences.applications["org.gnome.orca"] = { id: "org.gnome.orca", parameters: true };
				}
				else if(newPrefsWords[i] === "LAUNCH_SATOGO_SCREENREADER")
				{
					if(preferences!=null && preferences.applications!=null && preferences.applications["satogo.screenReader"]==null)
						preferences.applications["satogo.screenReader"] = { id: "satogo.screenReader", parameters: true };
				}
				else if(newPrefsWords[i] === "LAUNCH_TALKBACK_SCREENREADER")
				{
					if(preferences!=null && preferences.applications!=null && preferences.applications["com.android.talkback"]==null)
						preferences.applications["com.android.talkback"] = { id: "com.android.talkback", parameters: true };
				}
				else if(newPrefsWords[i] === "LAUNCH_WEBANYWHERE_SCREENREADER")
				{
					if(preferences!=null && preferences.applications!=null && preferences.applications["webinsight.webAnywhere.windows"]==null)
						preferences.applications["webinsight.webAnywhere.windows"] = { id: "webinsight.webAnywhere.windows", parameters: true };
				}
				else if(newPrefsWords[i] === "LAUNCH_WIN7BUILTINNARRATOR_SCREENREADER")
				{
					if(preferences!=null && preferences.applications!=null && preferences.applications["Win7BuiltInNarrator.screenReader"]==null)
						preferences.applications["Win7BuiltInNarrator.screenReader"] = { id: "Win7BuiltInNarrator.screenReader", parameters: true };
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
						if(solutions[solutionObj].id != null &&  solutions[solutionObj].id === "nvda.screenReader")
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
						if(solutions[solutionObj].id != null &&  solutions[solutionObj].id === "satogo.screenReader")
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
				else if(newPrefsWords[i] === "EXCLUDE_WEBANYWHERE_SCREENREADER")
				{
					var indexOfSolutionToBeExlcuded = -1;
					for(var solutionObj in solutions)
					{
						indexOfSolutionToBeExlcuded++;
						if(solutions[solutionObj].id != null &&  solutions[solutionObj].id === "webinsight.webAnywhere.windows")
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
				else if(newPrefsWords[i].indexOf("http://160.40.50.183/RBMM/RBMMFeedbackEnglish_") != -1)
				{
					feedbackEnglishFileURL = newPrefsWords[i];
				}				
				else if(newPrefsWords[i].indexOf("http://160.40.50.183/RBMM/RBMMFeedbackGerman_") != -1)
				{
					feedbackGermanFileURL = newPrefsWords[i];
				}
				else if(newPrefsWords[i].indexOf("http://160.40.50.183/RBMM/RBMMFeedbackGreek_") != -1)
				{
					feedbackGreekFileURL = newPrefsWords[i];
				}
				else if(newPrefsWords[i].indexOf("http://160.40.50.183/RBMM/RBMMFeedbackSpanish_") != -1)
				{
					feedbackSpanishFileURL = newPrefsWords[i];
				}
			}
			
			//fluid.log("\n\n\n\nsolutions AFTER EXCLUDING: ");
			//fluid.log(solutions);
			//fluid.log("\n\n\n\npreferences AFTER EXCLUDING: ");
			//fluid.log(preferences);
			
			// Feedback
			var DOWNLOAD_DIR = 'RBMM_Feedback';
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
			};
			
			resolver.resolve();
        }));
	
    return promise;
}
