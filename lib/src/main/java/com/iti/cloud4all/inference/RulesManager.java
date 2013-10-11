package com.iti.cloud4all.inference;
/**
 *
 * @author nkak
 */

import com.hp.hpl.jena.rdf.model.InfModel;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.reasoner.rulesys.GenericRuleReasoner;
import com.hp.hpl.jena.reasoner.rulesys.Rule;
import com.iti.cloud4all.ontology.*;
import java.io.BufferedReader;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;

public class RulesManager 
{
    public static final int GET_FIRST_INSTANCE_BETWEEN_SOLUTIONS_OF_THE_SAME_TYPE = 0;
    public static final int GET_RANDOM_INSTANCE_BEWTWEEN_SOLUTIONS_OF_THE_SAME_TYPE = 1;
    
    public Model m;
    public BufferedReader br;
    
    String uri_MatchMaker_rules;
    
    private static RulesManager instance = null;
    
    private RulesManager() 
    {
        m = ModelFactory.createDefaultModel();
        
        String currentDir = System.getProperty("user.dir");
        //uri_MatchMaker_rules = currentDir + "/../node_modules/universal/gpii/node_modules/matchMaker/src/RB_MM/extra-resources/MatchMakerRules.rules";
        uri_MatchMaker_rules = currentDir + "/lib/RB_MM/extra-resources/MatchMakerRules.rules";
    }
    
    public static RulesManager getInstance() 
    {
        if(instance == null) 
            instance = new RulesManager();
        return instance;
    }
    
    public String executeMyCloudRulesForFindingHandicapSituations(boolean writeInfModelForDebug)
    {
        String resultForNodeJs = "";

        //RULES EXECUTION - START
        List<Rule> rules = Rule.rulesFromURL(uri_MatchMaker_rules);
        GenericRuleReasoner r = new GenericRuleReasoner(rules);
        r.setOWLTranslation(true);           
        r.setTransitiveClosureCaching(true);
        InfModel infmodel = ModelFactory.createInfModel(r, OntologyManager.getInstance().model);
        OntologyManager.getInstance().model.add(infmodel.getDeductionsModel());
        //RULES EXECUTION - END
        
        OntologyManager.getInstance().getInstancesAfterRulesExecution();
      
        //get TempHandicapSituations
        if(OntologyManager.getInstance().allInstances_TempHandicapSituation != null)
        {
            for(int i=0; i<OntologyManager.getInstance().allInstances_TempHandicapSituation.size(); i++)
            {
                if(OntologyManager.getInstance().allInstances_TempHandicapSituation.get(i).problemWithMagnifierFullScreen)
                {
                    resultForNodeJs = "ENABLE_DEFAULT_THEME ENABLE_MAGNIFIER_WITH_INVERSE_COLOURS";
                    //break;
                }
                else if(OntologyManager.getInstance().allInstances_TempHandicapSituation.get(i).problemWithHighContrast)
                {
                    resultForNodeJs = "ENABLE_DEFAULT_THEME ENABLE_MAGNIFIER_WITH_INVERSE_COLOURS";
                    //break;
                }
            }
        }
        
        //get TempSolutionsToBeLaunched
        String tmpSolutionsToBeLaunchedIDs = "";
        if(OntologyManager.getInstance().allInstances_TempSolutionsToBeLaunched != null)
        {
            for(int i=0; i<OntologyManager.getInstance().allInstances_TempSolutionsToBeLaunched.size(); i++)
                tmpSolutionsToBeLaunchedIDs = tmpSolutionsToBeLaunchedIDs + OntologyManager.getInstance().allInstances_TempSolutionsToBeLaunched.get(i).toString();
        }
        
        resultForNodeJs = resultForNodeJs + " - SolutionsToBeLaunched: " + tmpSolutionsToBeLaunchedIDs;

        //DEBUG
        if(writeInfModelForDebug)
        {
            try
            {
                OutputStream out = new FileOutputStream("./lib/generatedOntologyWithTestUserAndEnvironmement.owl");
                OntologyManager.getInstance().model.write(out, "RDF/XML-ABBREV"); // readable rdf/xml
                out.close();            
            }
            catch(Exception e)
            {
                e.printStackTrace();
            }
        }
        //-DEBUG
        
        return resultForNodeJs;
    }
}