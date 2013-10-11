package com.iti.cloud4all.ontology;

import com.hp.hpl.jena.ontology.Individual;
import com.hp.hpl.jena.ontology.OntClass;
import com.hp.hpl.jena.ontology.OntModel;
import com.hp.hpl.jena.query.*;
import com.hp.hpl.jena.rdf.model.*;
import com.hp.hpl.jena.util.iterator.ExtendedIterator;
import com.hp.hpl.jena.vocabulary.RDF;
import com.iti.cloud4all.inference.RulesManager;
import com.iti.cloud4all.instantiation.InstantiationManager;
import com.iti.cloud4all.prevayler.OntologyModel;
import com.iti.cloud4all.prevayler.PrevaylerManager;
import java.io.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * @author nkak
 */
public class OntologyManager implements Serializable
{
    boolean printDebugInfo;
    
    public static final int TempUsers_ID = -1000;
    public static final int TempEnvironment_ID = -1001;
    public static final int TempHandicapSituations_ID = -1002;
    public static final int TempPossibleSolutions_ID = -1003;
    public static final int TempSolutionsToBeLaunched_ID = -1004;
    
    public static final int DTVDevices_ID = 1;
    public static final int GamingConsoleDevices_ID = 2;
    public static final int ATMDevices_ID = 3;
    public static final int InfokioskDevices_ID = 4;
    public static final int SmartHomeDevices_ID = 5;
    public static final int MSSurfaceDevices_ID = 6;
    public static final int SimpleMobilePhoneDevices_ID = 7;
    public static final int SmartMobilePhoneDevices_ID = 8;
    public static final int PDADevices_ID = 9;
    public static final int AtDriving_ID = 10;
    public static final int AtEntertainment_ID = 11;
    public static final int AtHome_ID = 12;
    public static final int AtWork_ID = 13;
    public static final int HoursOfTheDay_ID = 14;
    public static final int LinuxOSPlatforms_ID = 15;
    public static final int SUNOSOSPlatforms_ID = 16;
    public static final int Windows7OSPlatforms_ID = 17;
    public static final int WES2007_ID = 18;
    public static final int WES2009_ID = 19;
    public static final int WindowsVistaOSPlatform_ID = 20;
    public static final int WindowsXPOSPlatform_ID = 21;
    public static final int BrowserWithJava_ID = 22;
    public static final int Services_ID = 23;
    public static final int AccessSettings_ID = 24;
    public static final int AudioNotificationsGeneralSettings_ID = 25;
    public static final int AudioNotificationsLinkSettings_ID = 26;
    public static final int AudioVolumeSettings_ID = 27;
    public static final int SpeechRecognitionSettings_ID = 28;
    public static final int EchoOptionsSettings_ID = 29;
    public static final int TextToSpeechEngineSettings_ID = 30;
    public static final int TextToSpeechLanguageSettings_ID = 31;
    public static final int PunctuationSettings_ID = 32;
    public static final int ReadingCapitalsSettings_ID = 33;
    public static final int SpeakingRateSettings_ID = 34;
    public static final int SpeekingPitchSettings_ID = 35;
    public static final int VoiceSettings_ID = 36;
    public static final int VoiceVolume_ID = 37;
    public static final int EasyOneCommunicatorSeetings_ID = 38;
    public static final int LanguageSettings_ID = 39;
    public static final int MsSurfaceSettings_ID = 40;
    public static final int SAToGoSettings_ID = 41;
    public static final int SmartHouseSettings_ID = 42;
    public static final int BrailleDisplaySettings_ID = 43;
    public static final int GestureSettings_ID = 44;
    public static final int UsersAssistantsIDSettings_ID = 45;
    public static final int UsersContactsSettings_ID = 46;
    public static final int Gmail_ID = 47;
    public static final int UsersIDSettings_ID = 48;
    public static final int UsersLanguageSettings_ID = 49;
    public static final int UsersXMPPChatIDSettings_ID = 50;
    public static final int UsersXMPPPasswordSettings_ID = 51;
    public static final int ColorSettings_ID = 52;
    public static final int ButtonSettings_ID = 53;
    public static final int InterfaceSettings_ID = 54;
    public static final int KeyboardLayoutSettings_ID = 55;
    public static final int MagnifierSettings_ID = 56;
    public static final int SubtitleSettings_ID = 57;
    public static final int TextSizeSettings_ID = 58;
    public static final int TextStyleSettings_ID = 59;
    public static final int VisualNotificationsSettings_ID = 60;
    public static final int VisualResponseSettings_ID = 61;
    public static final int WebAnywhereSettings_ID = 62;
    public static final int SystemsToTransformImagesIntoSoundOrVoice_ID = 63;
    public static final int SatelliteNavigationSystem_ID = 64;
    public static final int WordProcessingSoftware_ID = 65;
    public static final int EasyOneCommunicator_ID = 66;
    public static final int SocialNetworkApp_ID = 67;
    public static final int SoftwareForSoundOrSpeechAmplification_ID = 68;
    public static final int PaperDocumentsReadingSystemOCR_ID = 69;
    public static final int SAToGo_ID = 70;
    public static final int SpeechStreamTextHelp_ID = 71;
    public static final int WebAnywhere_ID = 72;
    public static final int VideoMagnifier_ID = 73;
    public static final int DelayedCaptioningSystem_ID = 74;
    public static final int RealTimeCaptioningSystem_ID = 75;
    public static final int SoftwareInterfaceForComputer_ID = 76;
    public static final int eKiosk_ID = 77;
    public static final int AlternativeInputDeviceForComputer_ID = 78;
    public static final int EyegazeSystem_ID = 79;
    public static final int MsSurface_ID = 80;
    public static final int VoiceRecognitionSystem_ID = 81;
    public static final int PointingDevice_ID = 82;
    public static final int SwitchInterface_ID = 83;
    public static final int MouseControlSoftware_ID = 84;
    public static final int OnScreenKeyboard_ID = 85;
    public static final int SoftwareForAdjustingInoutDevicesResponse_ID = 86;
    public static final int WordPredictionSoftware_ID = 87;
    public static final int SpeechSynthesis_ID = 88;
    public static final int MagnifyingSoftware_ID = 89;
    public static final int ScreenReader_ID = 90;
    public static final int SoftwareForAdjustingColorCombinationAndTextSize_ID = 91;
    public static final int SoftwareToModifyThePointerAppearance_ID = 92;
    public static final int SmartHouse_ID = 93;
    public static final int DeviceVendors_ID = 94;
    public static final int PlatformVendors_ID = 95;
    public static final int SolutionVendors_ID = 96;
    
    //version 1_2
    
    public static final int PlatformSettings_AndroidPhoneInteractionSettings_ID = 97;
    public static final int PlatformSettings_AndroidPhoneSettings_ID = 98;
    public static final int PlatformSettings_DesktopSettings_ID = 99;
    public static final int PlatformSettings_DigitalTV_ID = 100;
    public static final int PlatformSettings_IOSPhoneSettings_ID = 101;
    public static final int PlatformSettings_SimplePhoneSettings_ID = 102;
    public static final int PlatformSettings_WindowsPhoneSettings_ID = 103;

    public static final int ApplicationSettings_EasyOneCommunicatorSettings_ID = 104;
    public static final int ApplicationSettings_EKioskSettings_ID = 105;
    public static final int ApplicationSettings_Maavis_ID = 106;
    public static final int ApplicationSettings_MSSurfaceSettings_ID = 107;
    public static final int ApplicationSettings_ReadWriteGold_TextHelp_ID = 108;
    public static final int ApplicationSettings_SAToGoSettings_ID = 109;
    public static final int ApplicationSettings_SocialNetworkAppSettings_ID = 110;
    public static final int ApplicationSettings_SpeechStream_TextHelp_ID = 111;
    public static final int ApplicationSettings_WebAnywhereSettings_ID = 112;

    public static final int GNOMEDesktopAccessibilitySettings_ID = 113;

    public static final int BrowserSettings_Firefox10_0_1Settings_ID = 114;
    public static final int BrowserSettings_IE8Settings_ID = 115;

    public static final int ScreenMagnifierSettings_ISO24751ScreenMagnifierSettings_ID = 116;
    public static final int ScreenMagnifierSettings_LinuxBuiltInScreenMagnifierSettings_ID = 117;
    public static final int ScreenMagnifierSettings_WindowsBuiltInScreenMagnifierSettings_ID = 118;
    public static final int ScreenMagnifierSettings_ZoomTextSettings_ID = 119;

    public static final int ScreenReaderSettings_ISO24751ScreenReaderSettings_ID = 120;
    public static final int ScreenReaderSettings_JAWSSettings_ID = 121;
    public static final int ScreenReaderSettings_NVDASettings_ID = 122;
    public static final int ScreenReaderSettings_OrcaSettings_ID = 123;
    public static final int ScreenReaderSettings_WinSevenBuiltInNarratorSettings_ID = 124;
    
    public static final int lastID = 124;
    
    public HashMap<Integer, String> classNamesAndIDs;
    
    public ArrayList<TempUser> allInstances_TempUser;
    public ArrayList<TempEnvironment> allInstances_TempEnvironment;
    public ArrayList<TempHandicapSituation> allInstances_TempHandicapSituation;
    public ArrayList<TempPossibleSolution> allInstances_TempPossibleSolution;
    public ArrayList<TempSolutionsToBeLaunched> allInstances_TempSolutionsToBeLaunched;
    public ArrayList<Solution> allInstances_Solution;
    
    public ArrayList<SolutionToBeLaunched> solutionsToBeLaunched;
    
    public OntModel model;
    
    private static OntologyManager instance = null;
    
    
    private OntologyManager() 
    {
        printDebugInfo = false;
        
        classNamesAndIDs = new HashMap<Integer, String>();
        
        classNamesAndIDs.put(TempUsers_ID, "TempUsers");
        classNamesAndIDs.put(TempEnvironment_ID, "TempEnvironment");
        classNamesAndIDs.put(TempHandicapSituations_ID, "TempHandicapSituations");
        classNamesAndIDs.put(TempPossibleSolutions_ID, "TempPossibleSolutions");
        classNamesAndIDs.put(TempSolutionsToBeLaunched_ID, "TempSolutionsToBeLaunched");
        classNamesAndIDs.put(DTVDevices_ID, "DTVDevices");
        classNamesAndIDs.put(GamingConsoleDevices_ID, "GamingConsoleDevices");
        classNamesAndIDs.put(ATMDevices_ID, "ATMDevices");
        classNamesAndIDs.put(InfokioskDevices_ID, "InfokioskDevices");
        classNamesAndIDs.put(SmartHomeDevices_ID, "SmartHomeDevices");
        classNamesAndIDs.put(MSSurfaceDevices_ID, "MSSurfaceDevices");
        classNamesAndIDs.put(SimpleMobilePhoneDevices_ID, "SimpleMobilePhoneDevices");
        classNamesAndIDs.put(SmartMobilePhoneDevices_ID, "SmartMobilePhoneDevices");
        classNamesAndIDs.put(PDADevices_ID, "PDADevices");
        classNamesAndIDs.put(AtDriving_ID, "AtDriving");
        classNamesAndIDs.put(AtEntertainment_ID, "AtEntertainment");
        classNamesAndIDs.put(AtHome_ID, "AtHome");
        classNamesAndIDs.put(AtWork_ID, "AtWork");
        classNamesAndIDs.put(HoursOfTheDay_ID, "HoursOfTheDay");
        classNamesAndIDs.put(LinuxOSPlatforms_ID, "LinuxOSPlatforms");
        classNamesAndIDs.put(SUNOSOSPlatforms_ID, "SUNOSOSPlatforms");
        classNamesAndIDs.put(Windows7OSPlatforms_ID, "Windows7OSPlatforms");
        classNamesAndIDs.put(WES2007_ID, "WES2007");
        classNamesAndIDs.put(WES2009_ID, "WES2009");
        classNamesAndIDs.put(WindowsVistaOSPlatform_ID, "WindowsVistaOSPlatform");
        classNamesAndIDs.put(WindowsXPOSPlatform_ID, "WindowsXPOSPlatform");
        classNamesAndIDs.put(BrowserWithJava_ID, "BrowserWithJava");
        classNamesAndIDs.put(Services_ID, "Services");
        classNamesAndIDs.put(AccessSettings_ID, "AccessSettings");
        classNamesAndIDs.put(AudioNotificationsGeneralSettings_ID, "AudioNotificationsGeneralSettings");
        classNamesAndIDs.put(AudioNotificationsLinkSettings_ID, "AudioNotificationsLinkSettings");
        classNamesAndIDs.put(AudioVolumeSettings_ID, "AudioVolumeSettings");
        classNamesAndIDs.put(SpeechRecognitionSettings_ID, "SpeechRecognitionSettings");
        classNamesAndIDs.put(EchoOptionsSettings_ID, "EchoOptionsSettings");
        classNamesAndIDs.put(TextToSpeechEngineSettings_ID, "TextToSpeechEngineSettings");
        classNamesAndIDs.put(TextToSpeechLanguageSettings_ID, "TextToSpeechLanguageSettings");
        classNamesAndIDs.put(PunctuationSettings_ID, "PunctuationSettings");
        classNamesAndIDs.put(ReadingCapitalsSettings_ID, "ReadingCapitalsSettings");
        classNamesAndIDs.put(SpeakingRateSettings_ID, "SpeakingRateSettings");
        classNamesAndIDs.put(SpeekingPitchSettings_ID, "SpeekingPitchSettings");
        classNamesAndIDs.put(VoiceSettings_ID, "VoiceSettings");
        classNamesAndIDs.put(VoiceVolume_ID, "VoiceVolume");
        classNamesAndIDs.put(EasyOneCommunicatorSeetings_ID, "EasyOneCommunicatorSeetings");
        classNamesAndIDs.put(LanguageSettings_ID, "LanguageSettings");
        classNamesAndIDs.put(MsSurfaceSettings_ID, "MsSurfaceSettings");
        classNamesAndIDs.put(SAToGoSettings_ID, "SAToGoSettings");
        classNamesAndIDs.put(SmartHouseSettings_ID, "SmartHouseSettings");
        classNamesAndIDs.put(BrailleDisplaySettings_ID, "BrailleDisplaySettings");
        classNamesAndIDs.put(GestureSettings_ID, "GestureSettings");
        classNamesAndIDs.put(UsersAssistantsIDSettings_ID, "UsersAssistantsIDSettings");
        classNamesAndIDs.put(UsersContactsSettings_ID, "UsersContactsSettings");
        classNamesAndIDs.put(Gmail_ID, "Gmail");
        classNamesAndIDs.put(UsersIDSettings_ID, "UsersIDSettings");
        classNamesAndIDs.put(UsersLanguageSettings_ID, "UsersLanguageSettings");
        classNamesAndIDs.put(UsersXMPPChatIDSettings_ID, "UsersXMPPChatIDSettings");
        classNamesAndIDs.put(UsersXMPPPasswordSettings_ID, "UsersXMPPPasswordSettings");
        classNamesAndIDs.put(ColorSettings_ID, "ColorSettings");
        classNamesAndIDs.put(ButtonSettings_ID, "ButtonSettings");
        classNamesAndIDs.put(InterfaceSettings_ID, "InterfaceSettings");
        classNamesAndIDs.put(KeyboardLayoutSettings_ID, "KeyboardLayoutSettings");
        classNamesAndIDs.put(MagnifierSettings_ID, "MagnifierSettings");
        classNamesAndIDs.put(SubtitleSettings_ID, "SubtitleSettings");
        classNamesAndIDs.put(TextSizeSettings_ID, "TextSizeSettings");
        classNamesAndIDs.put(TextStyleSettings_ID, "TextStyleSettings");
        classNamesAndIDs.put(VisualNotificationsSettings_ID, "VisualNotificationsSettings");
        classNamesAndIDs.put(VisualResponseSettings_ID, "VisualResponseSettings");
        classNamesAndIDs.put(WebAnywhereSettings_ID, "WebAnywhereSettings");
        classNamesAndIDs.put(SystemsToTransformImagesIntoSoundOrVoice_ID, "SystemsToTransformImagesIntoSoundOrVoice");
        classNamesAndIDs.put(SatelliteNavigationSystem_ID, "SatelliteNavigationSystem");
        classNamesAndIDs.put(WordProcessingSoftware_ID, "WordProcessingSoftware");
        classNamesAndIDs.put(EasyOneCommunicator_ID, "EasyOneCommunicator");
        classNamesAndIDs.put(SocialNetworkApp_ID, "SocialNetworkApp");
        classNamesAndIDs.put(SoftwareForSoundOrSpeechAmplification_ID, "SoftwareForSoundOrSpeechAmplification");
        classNamesAndIDs.put(PaperDocumentsReadingSystemOCR_ID, "PaperDocumentsReadingSystemOCR");
        classNamesAndIDs.put(SAToGo_ID, "SAToGo");
        classNamesAndIDs.put(SpeechStreamTextHelp_ID, "SpeechStreamTextHelp");
        classNamesAndIDs.put(WebAnywhere_ID, "WebAnywhere");
        classNamesAndIDs.put(VideoMagnifier_ID, "VideoMagnifier");
        classNamesAndIDs.put(DelayedCaptioningSystem_ID, "DelayedCaptioningSystem");
        classNamesAndIDs.put(RealTimeCaptioningSystem_ID, "RealTimeCaptioningSystem");
        classNamesAndIDs.put(SoftwareInterfaceForComputer_ID, "SoftwareInterfaceForComputer");
        classNamesAndIDs.put(eKiosk_ID, "eKiosk");
        classNamesAndIDs.put(AlternativeInputDeviceForComputer_ID, "AlternativeInputDeviceForComputer");
        classNamesAndIDs.put(EyegazeSystem_ID, "EyegazeSystem");
        classNamesAndIDs.put(MsSurface_ID, "MsSurface");
        classNamesAndIDs.put(VoiceRecognitionSystem_ID, "VoiceRecognitionSystem");
        classNamesAndIDs.put(PointingDevice_ID, "PointingDevice");
        classNamesAndIDs.put(SwitchInterface_ID, "SwitchInterface");
        classNamesAndIDs.put(MouseControlSoftware_ID, "MouseControlSoftware");
        classNamesAndIDs.put(OnScreenKeyboard_ID, "OnScreenKeyboard");
        classNamesAndIDs.put(SoftwareForAdjustingInoutDevicesResponse_ID, "SoftwareForAdjustingInoutDevicesResponse");
        classNamesAndIDs.put(WordPredictionSoftware_ID, "WordPredictionSoftware");
        classNamesAndIDs.put(SpeechSynthesis_ID, "SpeechSynthesis");
        classNamesAndIDs.put(MagnifyingSoftware_ID, "MagnifyingSoftware");
        classNamesAndIDs.put(ScreenReader_ID, "ScreenReaderSoftware");
        classNamesAndIDs.put(SoftwareForAdjustingColorCombinationAndTextSize_ID, "SoftwareForAdjustingColorCombinationAndTextSize");
        classNamesAndIDs.put(SoftwareToModifyThePointerAppearance_ID, "SoftwareToModifyThePointerAppearance");
        classNamesAndIDs.put(SmartHouse_ID, "SmartHouse");
        classNamesAndIDs.put(DeviceVendors_ID, "DeviceVendors");
        classNamesAndIDs.put(PlatformVendors_ID, "PlatformVendors");
        classNamesAndIDs.put(SolutionVendors_ID, "SolutionVendors");
        classNamesAndIDs.put(PlatformSettings_AndroidPhoneInteractionSettings_ID, "AndroidPhoneInteractionSettings");
        classNamesAndIDs.put(PlatformSettings_AndroidPhoneSettings_ID, "AndroidPhoneSettings");
        classNamesAndIDs.put(PlatformSettings_DesktopSettings_ID, "DesktopSettings");
        classNamesAndIDs.put(PlatformSettings_DigitalTV_ID, "DigitalTV");
        classNamesAndIDs.put(PlatformSettings_IOSPhoneSettings_ID, "IOSPhoneSettings");
        classNamesAndIDs.put(PlatformSettings_SimplePhoneSettings_ID, "SimplePhoneSettings");
        classNamesAndIDs.put(PlatformSettings_WindowsPhoneSettings_ID, "WindowsPhoneSettings");
        classNamesAndIDs.put(ApplicationSettings_EasyOneCommunicatorSettings_ID, "EasyOneCommunicatorSettings");
        classNamesAndIDs.put(ApplicationSettings_EKioskSettings_ID, "EKioskSettings");
        classNamesAndIDs.put(ApplicationSettings_Maavis_ID, "Maavis");
        classNamesAndIDs.put(ApplicationSettings_MSSurfaceSettings_ID, "MSSurfaceSettings");
        classNamesAndIDs.put(ApplicationSettings_ReadWriteGold_TextHelp_ID, "ReadWriteGold_TextHelp");
        classNamesAndIDs.put(ApplicationSettings_SAToGoSettings_ID, "SAToGoSettings");
        classNamesAndIDs.put(ApplicationSettings_SocialNetworkAppSettings_ID, "SocialNetworkAppSettings");
        classNamesAndIDs.put(ApplicationSettings_SpeechStream_TextHelp_ID, "SpeechStream_TextHelp");
        classNamesAndIDs.put(ApplicationSettings_WebAnywhereSettings_ID, "WebAnywhereSettings");
        classNamesAndIDs.put(GNOMEDesktopAccessibilitySettings_ID, "GNOMEDesktopAccessibilitySettings");
        classNamesAndIDs.put(BrowserSettings_Firefox10_0_1Settings_ID, "Firefox10_0_1Settings");
        classNamesAndIDs.put(BrowserSettings_IE8Settings_ID, "IE8Settings");
        classNamesAndIDs.put(ScreenMagnifierSettings_ISO24751ScreenMagnifierSettings_ID, "ISO24751ScreenMagnifierSettings");
        classNamesAndIDs.put(ScreenMagnifierSettings_LinuxBuiltInScreenMagnifierSettings_ID, "LinuxBuiltInScreenMagnifierSettings");
        classNamesAndIDs.put(ScreenMagnifierSettings_WindowsBuiltInScreenMagnifierSettings_ID, "WindowsBuiltInScreenMagnifierSettings");
        classNamesAndIDs.put(ScreenMagnifierSettings_ZoomTextSettings_ID, "ZoomTextSettings");
        classNamesAndIDs.put(ScreenReaderSettings_ISO24751ScreenReaderSettings_ID, "ISO24751ScreenReaderSettings");
        classNamesAndIDs.put(ScreenReaderSettings_JAWSSettings_ID, "JAWSSettings");
        classNamesAndIDs.put(ScreenReaderSettings_NVDASettings_ID, "NVDASettings");
        classNamesAndIDs.put(ScreenReaderSettings_OrcaSettings_ID, "OrcaSettings");
        classNamesAndIDs.put(ScreenReaderSettings_WinSevenBuiltInNarratorSettings_ID, "WinSevenBuiltInNarratorSettings");
        
        
        allInstances_TempUser = new ArrayList<TempUser>();
        allInstances_TempEnvironment = new ArrayList<TempEnvironment>();
        allInstances_TempHandicapSituation = new ArrayList<TempHandicapSituation>();
        allInstances_TempPossibleSolution = new ArrayList<TempPossibleSolution>();
        allInstances_TempSolutionsToBeLaunched = new ArrayList<TempSolutionsToBeLaunched>();
        allInstances_Solution = new ArrayList<Solution>();
        
        solutionsToBeLaunched = new ArrayList<SolutionToBeLaunched>();
        
        // create an empty model
        model = ModelFactory.createOntologyModel();
        loadOntology();
        
        if(PrevaylerManager.getInstance().isThereAnyOntModelStored())
        {
            PrevaylerManager.getInstance().debug = PrevaylerManager.getInstance().debug + "[MODEL FOUND]";
            
            ArrayList<String> allInstances_Solution_Str = PrevaylerManager.getInstance().getLastSolutionsArray();
            Solution tmpSol = null;
            int solCounter = 0;
            for(int i=0; i<allInstances_Solution_Str.size(); i++)
            {
                if(i%3 == 0)
                {
                    tmpSol = new Solution();
                    tmpSol.instanceName = allInstances_Solution_Str.get(i);
                }
                else if(i%3 == 1)
                    tmpSol.hasSolutionName = allInstances_Solution_Str.get(i);
                else if(i%3 == 2)
                {
                    solCounter++;
                    tmpSol.id = allInstances_Solution_Str.get(i);
                    allInstances_Solution.add(tmpSol);
                    //PrevaylerManager.getInstance().debug = PrevaylerManager.getInstance().debug + "\n\n[solution " + Integer.toString(solCounter) + "]" + tmpSol.toString();
                }
            }
            
            //PrevaylerManager.getInstance().debug = PrevaylerManager.getInstance().debug + "[MODEL FOUND][allInstances_Solution_Str size: " + Integer.toString(allInstances_Solution_Str.size()) + "]";
        }
        else
        {
            ExtendedIterator classes = model.listClasses();
        
            while(classes.hasNext())
            {
                OntClass tmpClass = (OntClass)classes.next();

                int tmpClassID = -1;
                if(tmpClass != null)
                    tmpClassID = getClassIDByName(tmpClass.getLocalName());

                //---------
                //Solutions
                //---------
                if(tmpClassID == SystemsToTransformImagesIntoSoundOrVoice_ID
                        || tmpClassID == SatelliteNavigationSystem_ID
                        || tmpClassID == WordProcessingSoftware_ID
                        || tmpClassID == EasyOneCommunicator_ID
                        || tmpClassID == SocialNetworkApp_ID
                        || tmpClassID == SoftwareForSoundOrSpeechAmplification_ID
                        || tmpClassID == PaperDocumentsReadingSystemOCR_ID
                        || tmpClassID == SAToGo_ID
                        || tmpClassID == SpeechStreamTextHelp_ID
                        || tmpClassID == WebAnywhere_ID
                        || tmpClassID == VideoMagnifier_ID
                        || tmpClassID == DelayedCaptioningSystem_ID
                        || tmpClassID == RealTimeCaptioningSystem_ID
                        || tmpClassID == SoftwareInterfaceForComputer_ID
                        || tmpClassID == eKiosk_ID
                        || tmpClassID == AlternativeInputDeviceForComputer_ID
                        || tmpClassID == EyegazeSystem_ID
                        || tmpClassID == MsSurface_ID
                        || tmpClassID == VoiceRecognitionSystem_ID
                        || tmpClassID == PointingDevice_ID
                        || tmpClassID == SwitchInterface_ID
                        || tmpClassID == MouseControlSoftware_ID
                        || tmpClassID == OnScreenKeyboard_ID
                        || tmpClassID == SoftwareForAdjustingInoutDevicesResponse_ID
                        || tmpClassID == WordPredictionSoftware_ID
                        || tmpClassID == SpeechSynthesis_ID
                        || tmpClassID == MagnifyingSoftware_ID
                        || tmpClassID == ScreenReader_ID
                        || tmpClassID == SoftwareForAdjustingColorCombinationAndTextSize_ID
                        || tmpClassID == SoftwareToModifyThePointerAppearance_ID
                        || tmpClassID == SmartHouse_ID)
                {
                    ExtendedIterator instances = tmpClass.listInstances();

                    while(instances.hasNext())
                    {
                        Individual tmpInstance = (Individual)instances.next();

                        Solution tmpSolution = new Solution();

                        //tmpSolution.classID = tmpClassID;
                        tmpSolution.instanceName = tmpInstance.getURI();
                        tmpSolution.id = tmpInstance.getPropertyValue(model.getProperty(InstantiationManager.NS, "id")).asLiteral().getValue().toString();
                        tmpSolution.hasSolutionName = tmpInstance.getPropertyValue(model.getProperty(InstantiationManager.NS, "hasSolutionName")).asLiteral().getValue().toString();
                        /*tmpSolution.hasSolutionDescription = tmpInstance.getPropertyValue(model.getProperty(InstantiationManager.NS, "hasSolutionDescription")).asLiteral().getValue().toString();
                        String tmpFreeAllowedNrOfInvocations = tmpInstance.getPropertyValue(model.getProperty(InstantiationManager.NS, "freeAllowedNrOfInvocations")).asLiteral().getValue().toString();
                        if(tmpFreeAllowedNrOfInvocations.length() > 0)
                            tmpSolution.freeAllowedNrOfInvocations = Integer.parseInt(tmpFreeAllowedNrOfInvocations);
                        String tmpHasCost = tmpInstance.getPropertyValue(model.getProperty(InstantiationManager.NS, "hasCost")).asLiteral().getValue().toString();
                        if(tmpHasCost.length() > 0)
                            tmpSolution.hasCost = Double.parseDouble(tmpHasCost);
                        tmpSolution.preferredLang = tmpInstance.getPropertyValue(model.getProperty(InstantiationManager.NS, "preferredLang")).asLiteral().getValue().toString();
                        tmpSolution.speechRate = tmpInstance.getPropertyValue(model.getProperty(InstantiationManager.NS, "speechRate")).asLiteral().getValue().toString();
                        tmpSolution.hasSolutionSpecificSetting = tmpInstance.getPropertyValue(model.getProperty(InstantiationManager.NS, "hasSolutionSpecificSetting")).asLiteral().getValue().toString();
                        tmpSolution.hasSolutionVendor = tmpInstance.getPropertyValue(model.getProperty(InstantiationManager.NS, "hasSolutionVendor")).asLiteral().getValue().toString();
                        tmpSolution.runsOnDevice = tmpInstance.getPropertyValue(model.getProperty(InstantiationManager.NS, "runsOnDevice")).asLiteral().getValue().toString();
                        tmpSolution.runsOnPlatform = tmpInstance.getPropertyValue(model.getProperty(InstantiationManager.NS, "runsOnPlatform")).asLiteral().getValue().toString();
                        tmpSolution.hasCostCurrency = tmpInstance.getPropertyValue(model.getProperty(InstantiationManager.NS, "hasCostCurrency")).asLiteral().getValue().toString();
                        tmpSolution.hasSolutionVersion = tmpInstance.getPropertyValue(model.getProperty(InstantiationManager.NS, "hasSolutionVersion")).asLiteral().getValue().toString();
                        */
                        allInstances_Solution.add(tmpSolution);
                    }
                }
            }
            
            PrevaylerManager.getInstance().updatePrevayler(allInstances_Solution);
            PrevaylerManager.getInstance().debug = PrevaylerManager.getInstance().debug + "[MODEL NOT FOUND]";
        }
    }
    
    public static OntologyManager getInstance() 
    {
        if(instance == null) 
            instance = new OntologyManager();
        return instance;
    }
    
    public void loadOntology()
    {
        String owlPathStr = System.getProperty("user.dir") + "/lib/RB_MM/extra-resources/semantincFrameworkOfContentAndSolutions.owl";
        InputStream in = null;
        
        try {
            in = new FileInputStream(owlPathStr);
        } catch(Exception ex) {
            Logger.getLogger(OntologyManager.class.getName()).log(Level.SEVERE, null, ex);
        }
        
        if (in == null) {
            throw new IllegalArgumentException( "File: semantincFrameworkOfContentAndSolutions.owl not found!");
        }
      
        // read the RDF/XML file
        model.read(in, "");
        
        try
        {
            in.close();
        }  catch(Exception ex) {
            Logger.getLogger(OntologyManager.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
    
    public static String fromStream(InputStream in) throws IOException
    {
        BufferedReader reader = new BufferedReader(new InputStreamReader(in));
        StringBuilder out = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            out.append(line);
        }
        return out.toString();
    }
    
    public int getClassIDByName(String tmpClassName)
    {
        Iterator<Integer> keySetIterator = classNamesAndIDs.keySet().iterator();

        while(keySetIterator.hasNext())
        {
            Integer key = keySetIterator.next();
            if(classNamesAndIDs.get(key).equals(tmpClassName))
                return key;
        }
        
        return -1;
    }
    
    public void sparql_get_TempHandicapSituations()
    {
        allInstances_TempHandicapSituation.clear();
        
        /*String sparqlPathStr = System.getProperty("user.dir") + "/lib/RB_MM/extra-resources/getTempHandicapSituations.sparql";
        String queryString = "";
        try {
            InputStream in = new FileInputStream(sparqlPathStr);
            queryString = fromStream(in);
        } catch(Exception ex) {
            Logger.getLogger(OntologyManager.class.getName()).log(Level.SEVERE, null, ex);
        }*/      
        String queryString = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> " +
            "PREFIX cld: <http://www.cloud4all.eu/SemanticFrameworkForContentAndSolutions.owl#>" +
            "SELECT * " + 
            "WHERE {" + 
            "?q rdf:type cld:TempHandicapSituations ; cld:TH_Magnification ?a ; cld:TH_ScreenReaderAndGnome ?b ; cld:TH_FontSize ?c ; cld:TH_ForegroundAndBackgroundColor ?d ; cld:TH_HighContrast ?e ; cld:TH_MagnifierFullScreen ?f " +
            "}";
        
        Query query = QueryFactory.create(queryString);
        // Execute the query and obtain results
        QueryExecution qe = QueryExecutionFactory.create(query, model);
        com.hp.hpl.jena.query.ResultSet results =  qe.execSelect();

        while (results.hasNext()) 
        {
            QuerySolution querySolution = results.nextSolution();
            Resource tmpInstance = querySolution.getResource("q");
            Literal problemWithMagnification_Literal = querySolution.getLiteral("a");
            Literal problemWithScreenReaderAndGnome_Literal = querySolution.getLiteral("b");
            Literal problemWithFontSize_Literal = querySolution.getLiteral("c");
            Literal problemWithForegroundAndBackgroundColor_Literal = querySolution.getLiteral("d");
            Literal problemWithHighContrast_Literal = querySolution.getLiteral("e");
            Literal problemWithMagnifierFullScreen_Literal = querySolution.getLiteral("f");
        
            TempHandicapSituation tmpHandicapSituation;
            TempHandicapSituation existingHandicapSituation = getTempHandicapSituation(tmpInstance.getURI());
            if(existingHandicapSituation == null)
                tmpHandicapSituation = new TempHandicapSituation();
            else
                tmpHandicapSituation = existingHandicapSituation;

            tmpHandicapSituation.instanceName = tmpInstance.getURI();
            if(problemWithMagnification_Literal != null) 
                tmpHandicapSituation.problemWithMagnification = problemWithMagnification_Literal.getBoolean();
            if(problemWithScreenReaderAndGnome_Literal != null) 
                tmpHandicapSituation.problemWithScreenReaderAndGnome = problemWithScreenReaderAndGnome_Literal.getBoolean();
            if(problemWithFontSize_Literal != null) 
                tmpHandicapSituation.problemWithFontSize = problemWithFontSize_Literal.getBoolean();
            if(problemWithForegroundAndBackgroundColor_Literal != null) 
                tmpHandicapSituation.problemWithForegroundAndBackgroundColor = problemWithForegroundAndBackgroundColor_Literal.getBoolean();
            if(problemWithHighContrast_Literal != null) 
                tmpHandicapSituation.problemWithHighContrast = problemWithHighContrast_Literal.getBoolean();
            if(problemWithMagnifierFullScreen_Literal != null) 
                tmpHandicapSituation.problemWithMagnifierFullScreen = problemWithMagnifierFullScreen_Literal.getBoolean();
        
            if(existingHandicapSituation == null)
                allInstances_TempHandicapSituation.add(tmpHandicapSituation);
            else
                allInstances_TempHandicapSituation.set(getTempHandicapSituationIndex(tmpInstance.getURI()), tmpHandicapSituation);
            
            //PrevaylerManager.getInstance().debug = PrevaylerManager.getInstance().debug + "\n[querySolution]" + querySolution.toString();
        }   

        qe.close();
        
        //for(int i=0; i<allInstances_TempHandicapSituation.size(); i++)
        //    PrevaylerManager.getInstance().debug = PrevaylerManager.getInstance().debug + "\n[TempHandicapSituation]" + allInstances_TempHandicapSituation.get(i).toString();
    }         
    
    public TempHandicapSituation getTempHandicapSituation(String instanceName) 
    {
        for (int i = 0; i < allInstances_TempHandicapSituation.size(); i++) 
        {
            if (((TempHandicapSituation)allInstances_TempHandicapSituation.get(i)).instanceName.equals(instanceName)) 
                return (TempHandicapSituation)allInstances_TempHandicapSituation.get(i);
        }
        return null;
    }
    
    public int getTempHandicapSituationIndex(String instanceName) 
    {
        for (int i = 0; i < allInstances_TempHandicapSituation.size(); i++) 
        {
            if (((TempHandicapSituation)allInstances_TempHandicapSituation.get(i)).instanceName.equals(instanceName)) 
                return i;
        }
        return -1;
    }
    
    public void sparql_get_TempPossibleSolutions()
    {
        allInstances_TempPossibleSolution.clear();
        // Create a new query
        String queryString =   
            "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>" +
            "PREFIX cld: <" + InstantiationManager.NS + ">" +
            "SELECT * " +
            "WHERE {" +
            "?instance rdf:type cld:TempPossibleSolutions ; cld:TempPossibleSolutions_comment ?comment ; cld:TempPossibleSolutions_text ?text  " +
            "} \n ";

        Query query = QueryFactory.create(queryString);
        // Execute the query and obtain results
        QueryExecution qe = QueryExecutionFactory.create(query, model);
        com.hp.hpl.jena.query.ResultSet results =  qe.execSelect();

        while (results.hasNext()) 
        {
            QuerySolution querySolution = results.nextSolution();
            Resource tmpInstance = querySolution.getResource("instance");
            Literal commentLiteral = querySolution.getLiteral("comment");
            Literal textLiteral = querySolution.getLiteral("text");
        
            TempPossibleSolution tmpPossibleSolution = new TempPossibleSolution();

            tmpPossibleSolution.instanceName = tmpInstance.getURI();
            if(commentLiteral == null) 
                tmpPossibleSolution.comment = "";
            else
                tmpPossibleSolution.comment = commentLiteral.getString();
            if(textLiteral == null) 
                tmpPossibleSolution.text = "";
            else
                tmpPossibleSolution.text = textLiteral.getString();
        
            allInstances_TempPossibleSolution.add(tmpPossibleSolution);
        }   

        qe.close();
    }
    
    public void sparql_get_TempSolutionsToBeLaunched()
    {
        allInstances_TempSolutionsToBeLaunched.clear();
        // Create a new query
        String queryString =   
            "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>" +
            "PREFIX cld: <" + InstantiationManager.NS + ">" +
            "SELECT * " +
            "WHERE {" +
            "?instance rdf:type cld:TempSolutionsToBeLaunched ; cld:TempSolutionsToBeLaunched_IDs ?IDs  " +
            "} \n ";

        Query query = QueryFactory.create(queryString);
        // Execute the query and obtain results
        QueryExecution qe = QueryExecutionFactory.create(query, model);
        com.hp.hpl.jena.query.ResultSet results =  qe.execSelect();

        TempSolutionsToBeLaunched tmpTempSolutionsToBeLaunched = new TempSolutionsToBeLaunched();
        while (results.hasNext()) 
        {
            QuerySolution querySolution = results.nextSolution();
            Resource tmpInstance = querySolution.getResource("instance");
            Resource tmpIDs = querySolution.getResource("IDs");
            tmpTempSolutionsToBeLaunched.IDs = tmpTempSolutionsToBeLaunched.IDs + getSolutionIDFromInstanceName(tmpIDs.getURI()) + " ";
        }   
        allInstances_TempSolutionsToBeLaunched.add(tmpTempSolutionsToBeLaunched);

        qe.close();
    }
   
    public void getInstancesAfterRulesExecution() 
    {
        //NEW WAY
        /*sparql_get_TempHandicapSituations();
        //sparql_get_TempPossibleSolutions();
        sparql_get_TempSolutionsToBeLaunched();*/
        
        //OLD WAY
        allInstances_TempHandicapSituation.clear();
        allInstances_TempPossibleSolution.clear();
        allInstances_TempSolutionsToBeLaunched.clear();
        
        solutionsToBeLaunched.clear();
        
        ExtendedIterator classes = model.listClasses();
        
        while(classes.hasNext())
        {
            OntClass tmpClass = (OntClass)classes.next();
            
            int tmpClassID = -1;
            if(tmpClass != null)
                tmpClassID = getClassIDByName(tmpClass.getLocalName());
            
            if(tmpClassID == TempHandicapSituations_ID
                    || tmpClassID == TempPossibleSolutions_ID
                    || tmpClassID == TempSolutionsToBeLaunched_ID)
            {
                ExtendedIterator instances = tmpClass.listInstances();
                
                while(instances.hasNext())
                {
                    Individual tmpInstance = (Individual)instances.next();
                    
                    //----------------------
                    //TempHandicapSituations
                    //----------------------
                    if(tmpClassID == TempHandicapSituations_ID)
                    {
                        TempHandicapSituation tmpTempHandicapSituation = new TempHandicapSituation();

                        if(tmpInstance.getPropertyValue(model.getProperty(InstantiationManager.NS, "TH_FontSize")) != null)
                            tmpTempHandicapSituation.problemWithFontSize = Boolean.parseBoolean(tmpInstance.getPropertyValue(model.getProperty(InstantiationManager.NS, "TH_FontSize")).asLiteral().getValue().toString());
                        if(tmpInstance.getPropertyValue(model.getProperty(InstantiationManager.NS, "TH_Magnification")) != null)
                            tmpTempHandicapSituation.problemWithMagnification = Boolean.parseBoolean(tmpInstance.getPropertyValue(model.getProperty(InstantiationManager.NS, "TH_Magnification")).asLiteral().getValue().toString());
                        if(tmpInstance.getPropertyValue(model.getProperty(InstantiationManager.NS, "TH_ForegroundAndBackgroundColor")) != null)
                            tmpTempHandicapSituation.problemWithForegroundAndBackgroundColor = Boolean.parseBoolean(tmpInstance.getPropertyValue(model.getProperty(InstantiationManager.NS, "TH_ForegroundAndBackgroundColor")).asLiteral().getValue().toString());
                        if(tmpInstance.getPropertyValue(model.getProperty(InstantiationManager.NS, "TH_ScreenReaderAndGnome")) != null)
                            tmpTempHandicapSituation.problemWithScreenReaderAndGnome = Boolean.parseBoolean(tmpInstance.getPropertyValue(model.getProperty(InstantiationManager.NS, "TH_ScreenReaderAndGnome")).asLiteral().getValue().toString());
                        if(tmpInstance.getPropertyValue(model.getProperty(InstantiationManager.NS, "TH_HighContrast")) != null)
                            tmpTempHandicapSituation.problemWithHighContrast = Boolean.parseBoolean(tmpInstance.getPropertyValue(model.getProperty(InstantiationManager.NS, "TH_HighContrast")).asLiteral().getValue().toString());
                        if(tmpInstance.getPropertyValue(model.getProperty(InstantiationManager.NS, "TH_MagnifierFullScreen")) != null)
                            tmpTempHandicapSituation.problemWithMagnifierFullScreen = Boolean.parseBoolean(tmpInstance.getPropertyValue(model.getProperty(InstantiationManager.NS, "TH_MagnifierFullScreen")).asLiteral().getValue().toString());

                        allInstances_TempHandicapSituation.add(tmpTempHandicapSituation);
                    }
                    //---------------------
                    //TempPossibleSolutions
                    //---------------------
                    //else if(tmpClassID == TempPossibleSolutions_ID)
                    //{
                    //    TempPossibleSolution tmpTempPossibleSolution = new TempPossibleSolution();
                    //
                    //    if(tmpInstance.getPropertyValue(model.getProperty(InstantiationManager.NS, "TempPossibleSolutions_text")) != null)
                    //        tmpTempPossibleSolution.text = tmpInstance.getPropertyValue(model.getProperty(InstantiationManager.NS, "TempPossibleSolutions_text")).asLiteral().getValue().toString();
                    //    if(tmpInstance.getPropertyValue(model.getProperty(InstantiationManager.NS, "TempPossibleSolutions_comment")) != null)
                    //        tmpTempPossibleSolution.comment = tmpInstance.getPropertyValue(model.getProperty(InstantiationManager.NS, "TempPossibleSolutions_comment")).asLiteral().getValue().toString();
                    //
                    //    allInstances_TempPossibleSolution.add(tmpTempPossibleSolution);
                    //}
                    //---------------------
                    //TempSolutionsToBeLaunched
                    //---------------------
                    else if(tmpClassID == TempSolutionsToBeLaunched_ID)
                    {
                        TempSolutionsToBeLaunched tmpTempSolutionsToBeLaunched = new TempSolutionsToBeLaunched();
                        //String IDsToBeLaunched = "";
                        StmtIterator it = tmpInstance.listProperties(model.getProperty(InstantiationManager.NS, "TempSolutionsToBeLaunched_IDs"));
                        //ArrayList<String> tmpAllSolutionsToBeLaunched = new ArrayList<String>();
                        while(it.hasNext())
                        {
                            Statement stmt = it.nextStatement();
                            
                            String tmpSolutionInstanceName = stmt.getObject().toString();
                            String tmpSolutionID = getSolutionIDFromInstanceName(tmpSolutionInstanceName);
                            String tmpSolutionClassName = getClassFromInstanceName(tmpSolutionInstanceName);
                            int tmpSolutionIndexInUserPrefs = getIndexInUserPrefs(tmpSolutionID);
                            
                            SolutionToBeLaunched tmpSolutionToBeLaunched = new SolutionToBeLaunched(tmpSolutionInstanceName, tmpSolutionID, tmpSolutionClassName, tmpSolutionIndexInUserPrefs);
                            //PrevaylerManager.getInstance().debug = PrevaylerManager.getInstance().debug + tmpSolutionToBeLaunched.toString();
                            solutionsToBeLaunched.add(tmpSolutionToBeLaunched);                            
                        }
                        tmpTempSolutionsToBeLaunched.IDs = getSolutionsToBeLaunched(RulesManager.GET_FIRST_INSTANCE_BETWEEN_SOLUTIONS_OF_THE_SAME_TYPE);
                        allInstances_TempSolutionsToBeLaunched.add(tmpTempSolutionsToBeLaunched);
                    }
                }
            }
        }
    }
    
    public String getInstanceNameBySolutionID(String tmpID)
    {
        String res = "not found!";
        
        if(allInstances_Solution != null)
        {
            for(int i=0; i<allInstances_Solution.size(); i++)
            {
                Solution tmpSolution = allInstances_Solution.get(i);
                if(tmpSolution.id!=null && tmpSolution.id.length()>0
                        && tmpSolution.id.toLowerCase().equals(tmpID.toLowerCase()))
                {
                    return tmpSolution.instanceName;
                }
            }
        }
        return res;
    }
    
    public String getSolutionIDFromInstanceName(String tmpInstanceName)
    {
        String res = "not found!";
        
        if(allInstances_Solution != null)
        {
            for(int i=0; i<allInstances_Solution.size(); i++)
            {
                Solution tmpSolution = allInstances_Solution.get(i);
                if(tmpSolution.instanceName!=null && tmpSolution.instanceName.length()>0
                        && tmpSolution.instanceName.equals(tmpInstanceName))
                {
                    return tmpSolution.id;
                }
            }
        }
        return res;
    }
    
    public String getClassFromInstanceName(String tmpInstanceName)
    {
        String res = "";
        
        Individual tmpIndividual = model.getIndividual(tmpInstanceName);

        /*for(Iterator i = tmpIndividual.listRDFTypes(true); i.hasNext(); ) 
        {
            Resource cls = (Resource) i.next();
            res = res + cls + " ";
        }*/
        res = tmpIndividual.getRDFType(true).toString();
        
        //PrevaylerManager.getInstance().debug = PrevaylerManager.getInstance().debug + "\n[" + tmpInstanceName + " IS " + res;
        
        return res;
    }
    
    public String getSolutionsToBeLaunched(int mode)
    {
        String res = "";
        ArrayList<SolutionToBeLaunched> finalSolutionsToBeLaunched = new ArrayList<SolutionToBeLaunched>();
        
        if(mode == RulesManager.GET_FIRST_INSTANCE_BETWEEN_SOLUTIONS_OF_THE_SAME_TYPE)
        {
            for(int i=0; i<solutionsToBeLaunched.size(); i++)   //examine one-by-one all solutions that can be launched
            {
                SolutionToBeLaunched tmpSolutionToBeLaunched = solutionsToBeLaunched.get(i);
                int indexOfExistingSolutionOfTheSameCategoryInFinalArray = aSolutionOfThisCategoryIsIncluded(finalSolutionsToBeLaunched, tmpSolutionToBeLaunched.category);
                if(indexOfExistingSolutionOfTheSameCategoryInFinalArray == -1)   //there is not any other solution of the same type to be launched, so add it to the ArrayList
                    finalSolutionsToBeLaunched.add(tmpSolutionToBeLaunched);
                else    //there is another solution of the same type to be launched
                {
                    //check the appearance order in user preferences and
                    //if current solution appears before the existing one in the array, replace existing with current
                    int indexOfExistingSolution = finalSolutionsToBeLaunched.get(indexOfExistingSolutionOfTheSameCategoryInFinalArray).indexInUserPrefs;
                    int indexOfCurrentSolution = tmpSolutionToBeLaunched.indexInUserPrefs;
                    if(indexOfCurrentSolution < indexOfExistingSolution)
                        finalSolutionsToBeLaunched.set(indexOfExistingSolutionOfTheSameCategoryInFinalArray, tmpSolutionToBeLaunched);
                }
            }
            for(int i=0; i<finalSolutionsToBeLaunched.size(); i++)
            {
                SolutionToBeLaunched tmpSolutionToBeLaunched = finalSolutionsToBeLaunched.get(i);
                res = res + tmpSolutionToBeLaunched.ID + " ";
            }
        }
        else if(mode == RulesManager.GET_RANDOM_INSTANCE_BEWTWEEN_SOLUTIONS_OF_THE_SAME_TYPE)
        {
            //TO BE COMPLETED...
        }
        return res;
    }
    
    public int getIndexInUserPrefs(String tmpSolutionID)
    {
        int res = -1;
        
        String[] tmpSpecificPreferencesForSolutions_Str = InstantiationManager.getInstance().USER_SpecificPreferencesForSolutions_IDs.split(" ");
        for(int i=0; i<tmpSpecificPreferencesForSolutions_Str.length; i++)
        {
            if(tmpSolutionID.equals(tmpSpecificPreferencesForSolutions_Str[i]))
                return i;//res = i;//
            //PrevaylerManager.getInstance().debug = PrevaylerManager.getInstance().debug + "\n(" + Integer.toString(i) + ") -> " + tmpSpecificPreferencesForSolutions_Str[i];
        }
        
        return res;
    }
    
    public int aSolutionOfThisCategoryIsIncluded(ArrayList<SolutionToBeLaunched> tmpFinalSolutionsToBeLaunched, String tmpCategory)
    {
        for(int i=0; i<tmpFinalSolutionsToBeLaunched.size(); i++)
        {
            SolutionToBeLaunched tmpSol = tmpFinalSolutionsToBeLaunched.get(i);
            if(tmpSol.category.equals(tmpCategory))
                return i;                
        }
        return -1;
    }
}