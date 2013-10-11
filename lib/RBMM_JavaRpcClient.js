/**
 * This module is an example of a client that will talk with a Java program
 * which is emitting a simple JSON based RPC protocol. The communication
 * protocol is a simple JSON string with a leading int that indicates the
 * string length. This is implemented in the Java example program by using
 * the Gson library to transcode messages. The client class
 *
 * @seealso http://www.hacksparrow.com/node-js-eventemitter-tutorial.html
 */

var util         = require('util');
var EventEmitter = require('events').EventEmitter;
var cp           = require('child_process');


/**
 * Expose the Java program functionality in a more convenient to work with
 * class module. In a non-example library, this might expose a lot more
 * useful functionality beyond just marshalling messages.
 */
var JavaRpcClient = function() {
    "use strict";
    var _self          = this;

    // The child process object we get when we spawn the java process
    var _javaSpawn     = null;

    // buffer for receiving messages in part and piecing them together later
    var _receiveBuffer = null;


    // The location of java and the - we're making these public because maybe
    // we want to change them in the user of this module.
    _self.javaPath  = 'java';
	//it is supposed that current path is the path of the "start.cmd" file
    _self.jarPath   = 'lib/RB_MM/Cloud4All_RuleBasedMatchMaker-1.0.jar';
    _self.verbose   = true;

    // list of events emitted - for informational purposes
    _self.events = [
        'spawn', 'message', 'exception', 'unknown', 'sent', 'java_error',

        // Response messages that then become events themselves
        'Error', 'Hello', 'Info'
    ];


    /**
     * Attach our own event handler to reply to the hello message.
     * This is just a convenience part of the protocol so that clients don't have to do it.
     * Also connects if connection data was supplied.
     */
    _self.on('Hello', function(){
        _self.sendHello();
    });


    /**
     * Executes the java process to begin sending and receiving communication
     */
    _self.run = function() {
        // Invoke the process
        _javaSpawn = cp.spawn(_self.javaPath, ['-jar', _self.jarPath]);

        // Wire up events
        _javaSpawn.stdout.on('data', onData);
        _javaSpawn.stderr.on('data', onJavaError);
        _javaSpawn.on('exit', function(code){
            console.log("The java program exited with code " + code + ".");
            
            // 127 means that the program/command couldn't be found
            if(127 === code) {
                console.log( "It looks like you might need to add the path to java.exe to your environment variables or specify the full path to it in the javaPath variable.");
            }
            
            // 1 likely means that the JAR cannot be found
            if(1 === code) { 
                console.log( "Java was executed, but it seems like the .jar file cannot be found. You might need to build the java program if you have only checked out the source; otherwise, you may need to check the path to the jar in the node script.");
            }
        });

        // Emit our own event to indicate to others that we have spawned
        _self.emit('spawn', _javaSpawn);
    };


    // sends the hello request message
    _self.sendHello = function() {
        sendMessage({
            messageName : 'Hello',
            version     : '0.1'
        });
    };

    // sends a message that will be echoed back as an Info message
    _self.sendEcho = function(message) {
        sendMessage({
            messageName : "Echo",
            message     : message
        });
    };

    // sends a message telling the java app to exit
    _self.sendGoodbye = function() {
        sendMessage({
           "messageName" : "Goodbye"
        });
    };
	
	_self.sendUserProfile = function(message, originalPrefs) 
	{
		var highContrast = false;
		if(message.display != null && message.display.screenEnhancement != null && message.display.screenEnhancement.highContrast != null)
		{
			if(message.display.screenEnhancement.highContrast === true)
			{
				highContrast = true;
			}
		}
		
		var magnifierFullScreen = false;
		if(message.display != null && message.display.screenEnhancement != null && message.display.screenEnhancement["-provisional-magnifierPosition"] != null)
		{
			if(message.display.screenEnhancement["-provisional-magnifierPosition"] === "FullScreen")
			{
				magnifierFullScreen = true;
			}
		}
		var tmpFontSize = -1;
		if(message.display != null && message.display.screenEnhancement != null && message.display.screenEnhancement.fontSize != null)
		{
			tmpFontSize = message.display.screenEnhancement.fontSize;
		}
		var tmpMagnification = -1.0;
		if(message.display != null && message.display.screenEnhancement != null && message.display.screenEnhancement.magnification != null)
		{
			tmpMagnification = message.display.screenEnhancement.magnification;
		}
		var tmpForegroundColor = "unknown";
		if(message.display != null && message.display.screenEnhancement != null && message.display.screenEnhancement.foregroundColor != null)
		{
			tmpForegroundColor = message.display.screenEnhancement.foregroundColor;
		}
		var tmpBackgroundColor = "unknown";
		if(message.display != null && message.display.screenEnhancement != null && message.display.screenEnhancement.backgroundColor != null)
		{
			tmpBackgroundColor = message.display.screenEnhancement.backgroundColor;
		}
		
		//find for which applications user has specific preferences
		var tmpSpecificPreferencesForSolutions_IDs = "";
		if(originalPrefs != null)
		{
			for(var appName in originalPrefs)
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
		
		sendMessage({ messageName : "UserProfile", fontSize  : tmpFontSize, magnification : tmpMagnification, foregroundColor : tmpForegroundColor, backgroundColor : tmpBackgroundColor, highContrast: highContrast, magnifierFullScreen: magnifierFullScreen, specificPreferencesForSolutions_IDs : tmpSpecificPreferencesForSolutions_IDs });
    };
	
	_self.sendDeviceReporterPayload = function(message) {
		var tmpInstalledSolutionsIDs = "";
		if(message.solutions != null)
		{
			for (var i=0; i<message.solutions.length; i++)
			{
				
				var tmpSolutionID = message.solutions[i].id;
				
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
	
        sendMessage({ messageName : "EnvironmentProfile", os_id  : message.OS.id, os_version : message.OS.version, installed_solutions_ids : tmpInstalledSolutionsIDs, available_solutions_ids : tmpAvailableSolutionsIDs });
    };
	
	_self.sendRunRules = function(message) {
        sendMessage({
            messageName : "RunRules",
			lastMessage : message
        });
    };


    /**
     * Sends a message object as a JSON encoded string to the java application for processing.
     */
    function sendMessage(msg) {
        // convert to json and prepare buffer
        var json      = JSON.stringify(msg);
        var byteLen   = Buffer.byteLength(json);
        var msgBuffer = new Buffer(4 + byteLen);

        // Write 4-byte length, followed by json, to buffer
        msgBuffer.writeUInt32BE(byteLen, 0);
        msgBuffer.write(json, 4, json.length, 'utf8');

        // send buffer to standard input on the java application
        _javaSpawn.stdin.write(msgBuffer);

        _self.emit('sent', msg);
    }
	
    /**
     * Receive data over standard input
     */
    function onData(data) {

        // Attach or extend receive buffer
        _receiveBuffer = (null === _receiveBuffer) ? data : Buffer.concat([_receiveBuffer, data]);

        // Pop all messages until the buffer is exhausted
        while(null !== _receiveBuffer && _receiveBuffer.length > 3) {
            var size = _receiveBuffer.readInt32BE(0);

            // Early exit processing if we don't have enough data yet
            if((size + 4) > _receiveBuffer.length) {
                break;
            }

            // Pull out the message
            var json = _receiveBuffer.toString('utf8', 4, (size + 4));

            // Resize the receive buffer
            _receiveBuffer = ((size + 4) === _receiveBuffer.length) ? null : _receiveBuffer.slice((size + 4));

            // Parse the message as a JSON object
            try {
                var msgObj = JSON.parse(json);

                // emit the generic message received event
                _self.emit('message', msgObj);

                // emit an object-type specific event
                if((typeof msgObj.messageName) === 'undefined') {
                    _self.emit('unknown', msgObj);
                } else {
                    _self.emit(msgObj.messageName, msgObj);
                }
            }
            catch(ex) {
                _self.emit('exception', ex);
            }
        }
    }


    /**
     * Receive error output from the java process
     */
    function onJavaError(data)
    {
        _self.emit('java_error', data.toString());
    }

};

// Make our JavaRpcClient class an EventEmitter
util.inherits(JavaRpcClient, EventEmitter);

// export our class
module.exports = JavaRpcClient;