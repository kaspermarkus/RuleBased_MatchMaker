/*
 * Rule-based Match Maker
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

(function() {
    "use strict";

    var fluid = fluid || require("infusion"),
        gpii = fluid.registerNamespace("gpii");

	var fs = require('fs');
    fluid.require("kettle", require);
    fluid.registerNamespace("gpii.ruleBasedMatchMaker");

    fluid.defaults("gpii.ruleBasedMatchMaker", {
        gradeNames: ["kettle.app", "autoInit"],
        components: {
            realRBMM: {
                type: "kettle.dataSource.URL",
                options: {
                    url: "http://160.40.50.183:8080/CLOUD4All_RBMM_Restful_WS/RBMM/runJSONLDRules",
					writable: true
               	}	
         	}
        },
        handlers: {
            matchPost: {
                route: "/match",
                type: "post"
            }
        }
    });

    fluid.defaults("kettle.requests.request.handler.matchPost", {
        gradeNames: ["autoInit", "fluid.littleComponent"],
        invokers: {
            handle: {
                funcName: "gpii.ruleBasedMatchMaker.match",
                args: ["{requestProxy}", "{request}.req.body", "{gpii.ruleBasedMatchMaker}.realRBMM"]
            }
        }
    });

    /*
     * Main function of the rule-based matchmaker
     */
    gpii.ruleBasedMatchMaker.match = function(requestProxy, payload, RBMMSource) {
	
		//debug - print input to file
		fs.writeFile("./DEBUG/input.json", JSON.stringify(payload, undefined, 2), function(err) {
			if(err) {
				console.log(err);
			} else {
				console.log("./DEBUG/input.json file was saved!");
			}
		});
	
        //Call the RESTful web-service of RBMM
        var promise = RBMMSource.set({}, payload, { writeMethod: "POST" });
        promise.then(function (returnData) { //argument is callback
            //this will contain the return from the POST request
			fluid.log("\n\nRBMM OUTPUT: " + JSON.stringify(returnData, undefined, 2));
			
			//debug - print output to file
			fs.writeFile("./DEBUG/output.json", JSON.stringify(returnData, undefined, 2), function(err) {
				if(err) {
					console.log(err);
				} else {
					console.log("./DEBUG/output.json file was saved!");
				}
			});
			
            requestProxy.events.onSuccess.fire(returnData);
        })
    };
})();