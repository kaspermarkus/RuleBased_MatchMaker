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
	
### Rule-based Matchmaker API

To run the rule-based matchmaker, simply type:

    [NODE_ENV={environment}] bin/ruleBasedMatchMaker [path/to/ruleBasedMatchMaker/configs/folder]

- Default environment is development.
- Path to configs folder can be absolute or relative to the current user directory.

For example:

    bin/ruleBasedMatchMaker
    bin/ruleBasedMatchMaker /Users/{userName}/ruleBasedMatchMaker/configs/
    NODE_ENV=production bin/ruleBasedMatchMaker configs/

The Rule-based Matchmaker currently supports the following urls:

    {url_to_a_sample_matchmaker_server}/match // POST
	
Usage example using [curl](http://curl.haxx.se/):

	curl -X POST -H "Content-Type: application/json" localhost:8080/match -d @testData\input_rule1Windows.json

Troubleshooting:

	When executing the Rule-based MatchMaker, a new directory (/logs) is automatically created. 
	If there are limited permissions, an exception will be thrown.
	In this case, try to manually create the "logs" directory at the root of the hard drive.
	
### Funding Acknowledgement

The research leading to these results has received funding from the European
Union's Seventh Framework Programme (FP7/2007-2013) under grant agreement No.289016

