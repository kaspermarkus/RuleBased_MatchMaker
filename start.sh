#!/bin/sh -e
 
NODE_ENV=${RBMM_JAVA:-"production"}
RBMM_JAVA_HOST_ADDRESS=${RBMM_JAVA:-"rbmm-java:8080"}
 
sed -e "s|^ *url: .*$|url: \"http://${RBMM_JAVA_HOST_ADDRESS}/CLOUD4All_RBMM_Restful_WS/RBMM/runJSONLDRules\",|" -i /opt/rbmm-nodejs/lib/RuleBasedMatchMaker.js
 
# Only for testing purposes
chown -R nobody /opt/rbmm-nodejs/DEBUG/*
 
cat >/etc/supervisord.d/rbmm_nodejs.ini<<EOF
[program:rbmm-nodejs]
command=node /opt/rbmm-nodejs/bin/ruleBasedMatchMaker
environment=NODE_ENV=${NODE_ENV}
user=nobody
autorestart=true
redirect_stderr=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
EOF
 
supervisord -c /etc/supervisord.conf 
