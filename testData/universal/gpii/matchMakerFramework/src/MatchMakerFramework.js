/*
* Match Maker Framework
*
* Copyright 2014 Raising the Floor - International
*
* Licensed under the New BSD license. You may not use this file except in
* compliance with this License.
*
* The research leading to these results has received funding from the European Union's
* Seventh Framework Programme (FP7/2007-2013)
* under grant agreement no. 289016.
*
* You may obtain a copy of the License at
* https://github.com/GPII/universal/blob/master/LICENSE.txt
*/

/* global require */
(function () {
    "use strict";

    var fluid = require("infusion"),
        gpii = fluid.registerNamespace("gpii"),
        semver = require("semver");

    fluid.registerNamespace("gpii.matchMakerFramework");

    gpii.matchMakerFramework.inverseCapabilities = require("./inverseCapabilities.json");

    fluid.defaults("gpii.matchMakerFramework", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        inverseCapabilities: gpii.matchMakerFramework.inverseCapabilities,
        matchMakerUrl: "%matchMakerPath/match",
        matchMakers: "{flowManager}.options.matchMakers",
        components: {
            matchMakerService: {
                type: "kettle.dataSource.URL",
                options: {
                    url: "{gpii.matchMakerFramework}.options.matchMakerUrl",
                    writable: true,
                    termMap: {
                        matchMakerPath: "%matchMakerPath"
                    }
                }
            },
            transformer: {
                type: "gpii.transformer"
            }
        },
        invokers: {
            preProcess: {
                funcName: "gpii.matchMakerFramework.preProcess",
                args: [ "{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2", "{arguments}.3", "{arguments}.4"]
                                     // user token, prefs, device, solutionsRegistry, event
            }
        },
        events: {
            onSolutions: null
        }
    });

    /*
     * Asynchronous function responsible for, given a matchMaker input payload, decide which matchmaker is most
     * suitable to do the actual matching process and send the payload there. Once the matchmaker
     * returns it's matched data, the event will be fired with both the returned and original data.
     *
     * @that (Object) - object containing a matchMakerService datasource component which can be used
     *     when sending the data to the actual match maker
     * @matchMakerPayload (Object) - a valid input payload for the matchmakers
     * @event (Object) - event to fire when the matchmaker has finished its matching
     */
    gpii.matchMakerFramework.matchMakerDispatcher = function (that, matchMakerPayload, event) {
        // TODO: some algorithm to decide the MM
        // console.log(JSON.stringify(matchMakerPayload, null, 4));
        var selectedMatchMaker = "RuleBased";
        fluid.log("MatchMaker Framework: dispatching to the " + selectedMatchMaker + " MatchMaker");
        var promise = that.matchMakerService.set({
            matchMakerPath: that.options.matchMakers[selectedMatchMaker].url
        }, matchMakerPayload, { writeMethod: "POST" });
        promise.then(function (matchData) {
            console.log("Returned from MM");
			
			fluid.log("\n\RRMM RESPONSE:\n");
			fluid.log(JSON.stringify(matchData, undefined, 2));
			//fluid.log("\n\nmatchMakerPayload:\n");
			//fluid.log(JSON.stringify(matchMakerPayload, undefined, 2));
			
            event.fire(matchData, matchMakerPayload);
        });
    };

    /*
     * Takes a solutions registry object and filters out all solutions that do not match the ones
     * reported by the device reporter.
     *
     * @solutions (Object) - solutions registry entries as retrieved from solutions registry
     * @device (Object) - device reporter data as retrieved from the device reporter
     *
     * @return (Object) - the solutions registry object, but with all the solutions not matching
     *      the device filtered out
     */
    gpii.matchMakerFramework.filterSolutions = function (solutions, device) {
        return fluid.remove_if(fluid.copy(solutions), function (solution, solutionId) {
            // Match on device solutions.
            var matchesSolutions = fluid.find(device.solutions, function (devSolution) {
                if (devSolution.id === solutionId &&
                    (!solution.version ||
                     !devSolution.version ||
                     semver.satisfies(devSolution.version, solution.version)
                    )) {
                    return true;
                }
            });
            if (!matchesSolutions) {
                return solutions;
            }
        });
    };

    /*
     * Converts application specific settings into common terms, keyed by application ids. Given a
     * set of preferences, for each application block in those preferences, the settings for which
     * inverse transformations exist will be transformed into common terms. All the common terms
     * that have successfully been inferred from an application will be written to a block keyed by
     * that applications ID.
     *
     * @preferences (Object) - An NP set (including contexts, etc)
     *
     * @return (Object) - Object where keys are solution IDs and entries are common term
     *      preferences which have been transformed from application specific settings for that
     *      soluion
     */
    gpii.matchMakerFramework.inferCommonTerms = function (preferences) {
        var irules = gpii.matchMakerFramework.inverseCapabilities;
        var togo = {};
        fluid.each(preferences.contexts, function (context, contextId) {
            var prefs = context.preferences;
            togo[contextId] = {};
            fluid.each(irules, function (rule, appId) {
                var appBlock = prefs["http://registry.gpii.net/applications/"+appId];
                if (appBlock) { // TODO: Currently we'll get an {} returned if no transformations matches settings
                    var out = fluid.model.transformWithRules(appBlock, irules[appId]);
                    togo[contextId][appId] = out;
                }
            });
        });
        return togo;
    };

    /*
     * responsible for building the input payload to the matchmaker, via a bunch of helper functions
     */
    gpii.matchMakerFramework.preProcess = function (that, userToken, preferences, deviceContext, solutionsRegistry, event) {
        var togo = {
            userToken: userToken,
            preferences: preferences,
            deviceReporter: deviceContext,
            solutionsRegistry: solutionsRegistry,
            activeContexts: [ // TODO calculate properly
                "gpii-default"
            ],
            environmentReporter: {}, // TODO,
            inferredCommonTerms: gpii.matchMakerFramework.inferCommonTerms(preferences)
        };

        gpii.matchMakerFramework.matchMakerDispatcher(that, togo, event);
    };
})();
