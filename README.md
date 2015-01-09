Rule-based Matchmaker
================

A server app built to be deployed with node.js server based on Kettle that
matches solution records to user needs and preferences.

The Rule-based Matchmaker operates by executing [Kettle](http://wiki.fluidproject.org/display/fluid/Kettle).

### Dependencies

[universal](https://github.com/GPII/universal)

Installation instructions
-

Firstly, install node and npm.

Run the following commands in your newly checked out Rule-based Matchmaker
repository. This will install all dependencies that are required by the Rule-based
Matchmaker.

    npm install
	grunt dedupe-infusion
	
### Rule-based Matchmaker API

To run the rule-based matchmaker, simply type:

    [NODE_ENV={environment}] node bin/ruleBasedMatchMaker

- Default environment is "development".

For example:

	set NODE_ENV=development
    node bin/ruleBasedMatchMaker

The Rule-based Matchmaker currently supports the following urls:

    {url_to_a_sample_matchmaker_server}/match // POST
	
In order to run the Rule-based Matchmaker in conjunction with the GPII framework, please follow the [instructions for setting up the GPII](http://wiki.gpii.net/w/Setting_Up_Your_Development_Environment), ensure that the [Rule-based Matchmaker is used for matchmaking](https://github.com/NickKaklanis/RuleBased_MatchMaker/blob/master/testData/universal/gpii/matchMakerFramework/src/MatchMakerFramework.js#L74) and put the corresponding URL in the [config file](https://github.com/NickKaklanis/RuleBased_MatchMaker/blob/master/testData/universal/gpii/matchMakerFramework/configs/rbmm.cloud.json#L18-L20). 

### Make it work with the [Rule-based RESTful web-service](https://github.com/NickKaklanis/RuleBasedMatchMaker_RESTful_WS_Maven/tree/review3) that you deployed in your own [Apache Tomcat server](http://tomcat.apache.org/)

The current project is the "Node.js part" of the Rule-based Matchmaker (RBMM) that uses internally the ["Maven RESTful part" of the RBMM](https://github.com/NickKaklanis/RuleBasedMatchMaker_RESTful_WS_Maven/tree/review3).
The "Maven RESTful part" of the RBMM is already deployed at http://160.40.50.183:8080.
However, if you want to deploy the "Maven RESTful part" in your own [Apache Tomcat server](http://tomcat.apache.org/), please follow the steps below:

1) Follow the instructions included [here](https://github.com/NickKaklanis/RuleBasedMatchMaker_RESTful_WS_Maven/tree/review3) for building and deploying the "Maven RESTful part"

2) Put in [lib/RuleBasedMatchMaker.js](https://github.com/NickKaklanis/RuleBased_MatchMaker/blob/master/lib/RuleBasedMatchMaker.js#L34) the IP & Port of the [Apache Tomcat server](http://tomcat.apache.org/) where you deployed the "Maven RESTful part" of the RBMM
	
### Funding Acknowledgement

The research leading to these results has received funding from the European
Union's Seventh Framework Programme (FP7/2007-2013) under grant agreement No.289016

