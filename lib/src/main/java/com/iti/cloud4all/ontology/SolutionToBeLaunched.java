package com.iti.cloud4all.ontology;

/**
 *
 * @author nkak
 */
public class SolutionToBeLaunched 
{
    public String instanceName;
    public String ID;
    public String category;
    public int indexInUserPrefs;
    
    public SolutionToBeLaunched()
    {
        instanceName = "";
        ID = "";
        category = "";
        indexInUserPrefs = -1;
    }    
    
    public SolutionToBeLaunched(String tmpInstanceName, String tmpID, String tmpCategory, int tmpIndexInUserPrefs)
    {
        instanceName = tmpInstanceName;
        ID = tmpID;
        category = tmpCategory;
        indexInUserPrefs = tmpIndexInUserPrefs;
    }
    
    @Override
    public String toString()
    {
        return "\n[instanceName:" + instanceName + ", ID: " + ID + ", Category: " + category + ", indexInUserPrefs: " + Integer.toString(indexInUserPrefs);
    }
}
