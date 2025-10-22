import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, Check, Globe, Loader2 } from 'lucide-react'
import logo from '../assets/logagold.png'
import { EgenkontrollService } from '@/shared/api/apiClient'

const EgenkontrollForm = () => {
  const [language, setLanguage] = useState('sv')
  const [expandedSections, setExpandedSections] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    // Projektinformation
    customerName: '',
    address: '',
    projectNumber: '',
    date: new Date().toISOString().split('T')[0],
    electricianName: '',
    certificationNumber: '',
    
    // Sektion 1: Förberedelse och Säkerhet
    section1: {
      workPermitObtained: false,
      safetyEquipmentChecked: false,
      voltageTestersCalibrated: false,
      isolationTestersAvailable: false,
      personalProtectiveEquipment: false,
      notes: '',
      photos: []
    },
    
    // Sektion 2: AC-Kabeldragning
    section2: {
      cableSizeCorrect: false,
      cableRoutingSafe: false,
      cableProtectionInstalled: false,
      cableMarkingComplete: false,
      fireSealsInstalled: false,
      notes: '',
      photos: []
    },
    
    // Sektion 3: Växelriktare (Inverter)
    section3: {
      inverterMountingSecure: false,
      inverterVentilationAdequate: false,
      dcConnectionsCorrect: false,
      acConnectionsCorrect: false,
      groundingVerified: false,
      inverterConfigured: false,
      notes: '',
      photos: []
    },
    
    // Sektion 4: Huvudcentral och Inkoppling
    section4: {
      circuitBreakerSizeCorrect: false,
      rcboInstalled: false,
      labelingComplete: false,
      connectionsTightened: false,
      phasesBalanced: false,
      notes: '',
      photos: []
    },
    
    // Sektion 5: Jordning och Överspänningsskydd
    section5: {
      earthingResistanceMeasured: false,
      earthingResistanceAcceptable: false,
      surgeProtectionInstalled: false,
      bondingConductorsInstalled: false,
      lightningProtectionConnected: false,
      notes: '',
      photos: []
    },
    
    // Sektion 6: Mätningar och Tester
    section6: {
      insulationResistanceTest: false,
      continuityTest: false,
      polarityTest: false,
      rcdTest: false,
      voltageTest: false,
      functionalTest: false,
      notes: '',
      photos: []
    },
    
    // Sektion 7: Dokumentation och Certifiering
    section7: {
      schematicDiagramsComplete: false,
      installationCertificateIssued: false,
      testResultsDocumented: false,
      userManualProvided: false,
      warrantyDocumentsProvided: false,
      notes: '',
      photos: []
    },
    
    // Sektion 8: Slutkontroll och Driftsättning
    section8: {
      systemStartedSuccessfully: false,
      monitoringSystemConnected: false,
      customerInstructed: false,
      siteCleanedUp: false,
      finalInspectionComplete: false,
      notes: '',
      photos: []
    },
    
    // Signaturer
    electricianSignature: '',
    customerSignature: ''
  })

  const translations = {
    sv: {
      title: 'Egenkontroll - Elinstallation Solceller',
      subtitle: 'Solpulsen Energy Norden AB',
      projectInfo: 'Projektinformation',
      customerName: 'Kundnamn',
      address: 'Adress',
      projectNumber: 'Projektnummer',
      date: 'Datum',
      electricianName: 'Elektrikerens namn',
      certificationNumber: 'Certifieringsnummer (Auktorisation)',
      
      section1Title: 'Förberedelse och Säkerhet',
      section1Items: {
        workPermitObtained: 'Arbetstillstånd inhämtat',
        safetyEquipmentChecked: 'Säkerhetsutrustning kontrollerad',
        voltageTestersCalibrated: 'Spänningsmätare kalibrerade',
        isolationTestersAvailable: 'Isolationsmätare tillgängliga',
        personalProtectiveEquipment: 'Personlig skyddsutrustning används'
      },
      
      section2Title: 'AC-Kabeldragning',
      section2Items: {
        cableSizeCorrect: 'Korrekt kabelarea enligt beräkning',
        cableRoutingSafe: 'Kabeldragning säker och enligt standard',
        cableProtectionInstalled: 'Kabelskydd installerat',
        cableMarkingComplete: 'Kabelmärkning komplett',
        fireSealsInstalled: 'Brandtätningar installerade'
      },
      
      section3Title: 'Växelriktare (Inverter)',
      section3Items: {
        inverterMountingSecure: 'Växelriktare säkert monterad',
        inverterVentilationAdequate: 'Ventilation tillräcklig',
        dcConnectionsCorrect: 'DC-anslutningar korrekta och säkra',
        acConnectionsCorrect: 'AC-anslutningar korrekta',
        groundingVerified: 'Jordning verifierad',
        inverterConfigured: 'Växelriktare konfigurerad och testad'
      },
      
      section4Title: 'Huvudcentral och Inkoppling',
      section4Items: {
        circuitBreakerSizeCorrect: 'Korrekt säkringsstorlek',
        rcboInstalled: 'Jordfelsbrytare installerad',
        labelingComplete: 'Märkning komplett i centralskåp',
        connectionsTightened: 'Alla anslutningar åtdragna',
        phasesBalanced: 'Faser balanserade'
      },
      
      section5Title: 'Jordning och Överspänningsskydd',
      section5Items: {
        earthingResistanceMeasured: 'Jordresistans uppmätt',
        earthingResistanceAcceptable: 'Jordresistans inom acceptabelt värde',
        surgeProtectionInstalled: 'Överspänningsskydd installerat',
        bondingConductorsInstalled: 'Utjämningsledare installerade',
        lightningProtectionConnected: 'Åskskydd anslutet (om tillämpligt)'
      },
      
      section6Title: 'Mätningar och Tester',
      section6Items: {
        insulationResistanceTest: 'Isolationsresistans testad (≥1 MΩ)',
        continuityTest: 'Kontinuitetstest utförd',
        polarityTest: 'Polaritetstest utförd',
        rcdTest: 'Jordfelsbrytare testad',
        voltageTest: 'Spänningsmätning utförd',
        functionalTest: 'Funktionstest utfört'
      },
      
      section7Title: 'Dokumentation och Certifiering',
      section7Items: {
        schematicDiagramsComplete: 'Elschema kompletta',
        installationCertificateIssued: 'Installationsintyg utfärdat',
        testResultsDocumented: 'Mätprotokoll dokumenterade',
        userManualProvided: 'Bruksanvisning överlämnad',
        warrantyDocumentsProvided: 'Garantidokument överlämnade'
      },
      
      section8Title: 'Slutkontroll och Driftsättning',
      section8Items: {
        systemStartedSuccessfully: 'System startat framgångsrikt',
        monitoringSystemConnected: 'Övervakningssystem anslutet',
        customerInstructed: 'Kund instruerad i systemets funktion',
        siteCleanedUp: 'Arbetsplats städad',
        finalInspectionComplete: 'Slutbesiktning genomförd'
      },
      
      notes: 'Anteckningar',
      uploadPhotos: 'Ladda upp foton',
      signatures: 'Signaturer',
      electricianSignature: 'Elektrikerens signatur',
      customerSignature: 'Kundens signatur',
      submitForm: 'Skicka formulär',
      submitting: 'Skickar...',
      confirmationMessage: 'Formulär skickat! Tack för din egenkontroll.',
      errorMessage: 'Ett fel uppstod vid insändning. Försök igen.'
    },
    en: {
      title: 'Quality Control - Electrical Installation Solar Panels',
      subtitle: 'Solpulsen Energy Norden AB',
      projectInfo: 'Project Information',
      customerName: 'Customer Name',
      address: 'Address',
      projectNumber: 'Project Number',
      date: 'Date',
      electricianName: 'Electrician Name',
      certificationNumber: 'Certification Number (Authorization)',
      
      section1Title: 'Preparation and Safety',
      section1Items: {
        workPermitObtained: 'Work permit obtained',
        safetyEquipmentChecked: 'Safety equipment checked',
        voltageTestersCalibrated: 'Voltage testers calibrated',
        isolationTestersAvailable: 'Insulation testers available',
        personalProtectiveEquipment: 'Personal protective equipment used'
      },
      
      section2Title: 'AC Cable Installation',
      section2Items: {
        cableSizeCorrect: 'Correct cable size per calculation',
        cableRoutingSafe: 'Cable routing safe and per standard',
        cableProtectionInstalled: 'Cable protection installed',
        cableMarkingComplete: 'Cable marking complete',
        fireSealsInstalled: 'Fire seals installed'
      },
      
      section3Title: 'Inverter Installation',
      section3Items: {
        inverterMountingSecure: 'Inverter securely mounted',
        inverterVentilationAdequate: 'Ventilation adequate',
        dcConnectionsCorrect: 'DC connections correct and secure',
        acConnectionsCorrect: 'AC connections correct',
        groundingVerified: 'Grounding verified',
        inverterConfigured: 'Inverter configured and tested'
      },
      
      section4Title: 'Main Panel and Connection',
      section4Items: {
        circuitBreakerSizeCorrect: 'Correct circuit breaker size',
        rcboInstalled: 'RCBO installed',
        labelingComplete: 'Labeling complete in panel',
        connectionsTightened: 'All connections tightened',
        phasesBalanced: 'Phases balanced'
      },
      
      section5Title: 'Grounding and Surge Protection',
      section5Items: {
        earthingResistanceMeasured: 'Earthing resistance measured',
        earthingResistanceAcceptable: 'Earthing resistance within acceptable value',
        surgeProtectionInstalled: 'Surge protection installed',
        bondingConductorsInstalled: 'Bonding conductors installed',
        lightningProtectionConnected: 'Lightning protection connected (if applicable)'
      },
      
      section6Title: 'Measurements and Tests',
      section6Items: {
        insulationResistanceTest: 'Insulation resistance tested (≥1 MΩ)',
        continuityTest: 'Continuity test performed',
        polarityTest: 'Polarity test performed',
        rcdTest: 'RCD tested',
        voltageTest: 'Voltage measurement performed',
        functionalTest: 'Functional test performed'
      },
      
      section7Title: 'Documentation and Certification',
      section7Items: {
        schematicDiagramsComplete: 'Schematic diagrams complete',
        installationCertificateIssued: 'Installation certificate issued',
        testResultsDocumented: 'Test results documented',
        userManualProvided: 'User manual provided',
        warrantyDocumentsProvided: 'Warranty documents provided'
      },
      
      section8Title: 'Final Inspection and Commissioning',
      section8Items: {
        systemStartedSuccessfully: 'System started successfully',
        monitoringSystemConnected: 'Monitoring system connected',
        customerInstructed: 'Customer instructed in system operation',
        siteCleanedUp: 'Site cleaned up',
        finalInspectionComplete: 'Final inspection complete'
      },
      
      notes: 'Notes',
      uploadPhotos: 'Upload Photos',
      signatures: 'Signatures',
      electricianSignature: 'Electrician Signature',
      customerSignature: 'Customer Signature',
      submitForm: 'Submit Form',
      submitting: 'Submitting...',
      confirmationMessage: 'Form submitted! Thank you for your quality control.',
      errorMessage: 'An error occurred during submission. Please try again.'
    }
  }

  // Säkerställ att vi alltid har en giltig translation
  const getTranslation = () => {
    const translation = translations[language]
    if (!translation) {
      console.warn(`Translation for language '${language}' not found, falling back to Swedish`)
      return translations.sv
    }
    return translation
  }

  const t = getTranslation()

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleCheckboxChange = (section, field) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: !prev[section][field]
      }
    }))
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNotesChange = (section, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        notes: value
      }
    }))
  }

  // File to base64 conversion function
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        resolve({
          name: file.name,
          data: e.target.result, // Full data URL
          type: file.type,
          size: file.size
        })
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handlePhotoUpload = async (section, files) => {
    try {
      const base64Images = await Promise.all(
        Array.from(files).map(convertFileToBase64)
      )
      
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          photos: [...(prev[section].photos || []), ...base64Images]
        }
      }))
    } catch (error) {
      console.error('Error converting images:', error)
      alert('Error uploading photos. Please try again.')
    }
  }

  // Function to reset form after successful submission
  const resetForm = () => {
    setFormData({
      customerName: '',
      address: '',
      projectNumber: '',
      date: new Date().toISOString().split('T')[0],
      electricianName: '',
      certificationNumber: '',
      section1: {
        workPermitObtained: false,
        safetyEquipmentChecked: false,
        voltageTestersCalibrated: false,
        isolationTestersAvailable: false,
        personalProtectiveEquipment: false,
        notes: '',
        photos: []
      },
      section2: {
        cableSizeCorrect: false,
        cableRoutingSafe: false,
        cableProtectionInstalled: false,
        cableMarkingComplete: false,
        fireSealsInstalled: false,
        notes: '',
        photos: []
      },
      section3: {
        inverterMountingSecure: false,
        inverterVentilationAdequate: false,
        dcConnectionsCorrect: false,
        acConnectionsCorrect: false,
        groundingVerified: false,
        inverterConfigured: false,
        notes: '',
        photos: []
      },
      section4: {
        circuitBreakerSizeCorrect: false,
        rcboInstalled: false,
        labelingComplete: false,
        connectionsTightened: false,
        phasesBalanced: false,
        notes: '',
        photos: []
      },
      section5: {
        earthingResistanceMeasured: false,
        earthingResistanceAcceptable: false,
        surgeProtectionInstalled: false,
        bondingConductorsInstalled: false,
        lightningProtectionConnected: false,
        notes: '',
        photos: []
      },
      section6: {
        insulationResistanceTest: false,
        continuityTest: false,
        polarityTest: false,
        rcdTest: false,
        voltageTest: false,
        functionalTest: false,
        notes: '',
        photos: []
      },
      section7: {
        schematicDiagramsComplete: false,
        installationCertificateIssued: false,
        testResultsDocumented: false,
        userManualProvided: false,
        warrantyDocumentsProvided: false,
        notes: '',
        photos: []
      },
      section8: {
        systemStartedSuccessfully: false,
        monitoringSystemConnected: false,
        customerInstructed: false,
        siteCleanedUp: false,
        finalInspectionComplete: false,
        notes: '',
        photos: []
      },
      electricianSignature: '',
      customerSignature: ''
    })
    setExpandedSections({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Prepare the form data for submission
      const submissionData = {
        ...formData,
        // Ensure all sections have photos array
        section1: {
          ...formData.section1,
          photos: formData.section1.photos || []
        },
        section2: {
          ...formData.section2,
          photos: formData.section2.photos || []
        },
        section3: {
          ...formData.section3,
          photos: formData.section3.photos || []
        },
        section4: {
          ...formData.section4,
          photos: formData.section4.photos || []
        },
        section5: {
          ...formData.section5,
          photos: formData.section5.photos || []
        },
        section6: {
          ...formData.section6,
          photos: formData.section6.photos || []
        },
        section7: {
          ...formData.section7,
          photos: formData.section7.photos || []
        },
        section8: {
          ...formData.section8,
          photos: formData.section8.photos || []
        }
      }

      // Submit to backend
      const result = await EgenkontrollService.submitForm(submissionData)
      
      // Show success message
      alert(t.confirmationMessage)
      console.log('Form submitted successfully:', result)
      
      // Reset form after successful submission
      resetForm()
      
    } catch (error) {
      console.error('Error submitting form:', error)
      alert(t.errorMessage || 'Error submitting form. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderSection = (sectionNumber, sectionKey, title, items) => {
    const isExpanded = expandedSections[sectionKey]
    
    return (
      <Card key={sectionKey} className="mb-4 border-2 border-gray-200 hover:border-[#C9A44A] transition-colors">
        <CardHeader 
          className="cursor-pointer bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all"
          onClick={() => toggleSection(sectionKey)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className="bg-[#C9A44A] text-white text-lg px-3 py-1">
                {sectionNumber}
              </Badge>
              <CardTitle className="text-xl">{title}</CardTitle>
            </div>
            {isExpanded ? <ChevronUp className="text-[#C9A44A]" /> : <ChevronDown className="text-gray-400" />}
          </div>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="pt-6">
            <div className="space-y-4">
              {Object.entries(items).map(([key, label]) => (
                <div key={key}  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" >
                  <Checkbox
                    id={`${sectionKey}-${key}`}
                    checked={formData[sectionKey][key]}
                    onCheckedChange={() => handleCheckboxChange(sectionKey, key)}
                    className="data-[state=checked]:bg-[#C9A44A] data-[state=checked]:border-[#C9A44A]"
                  />
                  <Label 
                    htmlFor={`${sectionKey}-${key}`}
                    className="flex-1 cursor-pointer text-base"
                  >
                    {label}
                  </Label>
                </div>
              ))}
              
              <div className="mt-6">
                <Label htmlFor={`${sectionKey}-notes`} className="text-base font-semibold mb-2 block">
                  {t.notes}
                </Label>
                <Textarea
                  id={`${sectionKey}-notes`}
                  value={formData[sectionKey].notes}
                  onChange={(e) => handleNotesChange(sectionKey, e.target.value)}
                  className="min-h-[100px] border-2 focus:border-[#C9A44A]"
                  placeholder={`${t.notes}...`}
                />
              </div>
              
              <div className="mt-4">
                <Label htmlFor={`${sectionKey}-photos`} className="text-base font-semibold mb-2 block">
                  📸 {t.uploadPhotos}
                </Label>
                <Input
                  id={`${sectionKey}-photos`}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload(sectionKey, e.target.files)}
                  className="border-2 focus:border-[#C9A44A]"
                />
                {formData[sectionKey].photos && formData[sectionKey].photos.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    {formData[sectionKey].photos.length} photo(s) uploaded
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#2C3E50] to-[#34495E] text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logo} alt="Solpulsen Logo" className="h-12 w-12 object-contain" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{t?.title || 'Egenkontroll - Elinstallation Solceller'}</h1>
                <p className="text-sm text-gray-300">{t?.subtitle || 'Solpulsen Energy Norden AB'}</p>
              </div>
            </div>
            <Button
              onClick={() => setLanguage(language === 'sv' ? 'en' : 'sv')}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 border-white/30 text-white mt-2"
            >
              <Globe className="mr-2 h-4 w-4" />
              {language === 'sv' ? 'English' : 'Svenska'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit}>
          {/* Projektinformation */}
          <Card className="mb-6 border-2 border-[#C9A44A] shadow-lg">
            <CardHeader className="bg-gradient-to-r from-[#C9A44A] to-[#B8934A] text-white">
              <div className="flex items-center gap-3">
                <Badge className="bg-white text-[#C9A44A] text-lg px-3 py-1">ℹ️</Badge>
                <CardTitle className="text-2xl">{t?.projectInfo || 'Projektinformation'}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="customerName" className="text-base font-semibold mb-2 block">
                    {t?.customerName || 'Kundnamn'}
                  </Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    className="border-2 focus:border-[#C9A44A]"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="address" className="text-base font-semibold mb-2 block">
                    {t?.address || 'Adress'}
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="border-2 focus:border-[#C9A44A]"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="projectNumber" className="text-base font-semibold mb-2 block">
                    {t?.projectNumber || 'Projektnummer'}
                  </Label>
                  <Input
                    id="projectNumber"
                    value={formData.projectNumber}
                    onChange={(e) => handleInputChange('projectNumber', e.target.value)}
                    className="border-2 focus:border-[#C9A44A]"
                    placeholder="SP-2025-"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="date" className="text-base font-semibold mb-2 block">
                    {t?.date || 'Datum'}
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="border-2 focus:border-[#C9A44A]"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="electricianName" className="text-base font-semibold mb-2 block">
                    {t?.electricianName || 'Elektrikerens namn'}
                  </Label>
                  <Input
                    id="electricianName"
                    value={formData.electricianName}
                    onChange={(e) => handleInputChange('electricianName', e.target.value)}
                    className="border-2 focus:border-[#C9A44A]"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="certificationNumber" className="text-base font-semibold mb-2 block">
                    {t?.certificationNumber || 'Certifieringsnummer (Auktorisation)'}
                  </Label>
                  <Input
                    id="certificationNumber"
                    value={formData.certificationNumber}
                    onChange={(e) => handleInputChange('certificationNumber', e.target.value)}
                    className="border-2 focus:border-[#C9A44A]"
                    placeholder="EL-XXXX"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sections */}
          {renderSection(1, 'section1', t?.section1Title || 'Förberedelse och Säkerhet', t?.section1Items || {})}
          {renderSection(2, 'section2', t?.section2Title || 'AC-Kabeldragning', t?.section2Items || {})}
          {renderSection(3, 'section3', t?.section3Title || 'Växelriktare (Inverter)', t?.section3Items || {})}
          {renderSection(4, 'section4', t?.section4Title || 'Huvudcentral och Inkoppling', t?.section4Items || {})}
          {renderSection(5, 'section5', t?.section5Title || 'Jordning och Överspänningsskydd', t?.section5Items || {})}
          {renderSection(6, 'section6', t?.section6Title || 'Mätningar och Tester', t?.section6Items || {})}
          {renderSection(7, 'section7', t?.section7Title || 'Dokumentation och Certifiering', t?.section7Items || {})}
          {renderSection(8, 'section8', t?.section8Title || 'Slutkontroll och Driftsättning', t?.section8Items || {})}

          {/* Signatures */}
          <Card className="mb-6 border-2 border-[#C9A44A] shadow-lg">
            <CardHeader className="bg-gradient-to-r from-[#C9A44A] to-[#B8934A] text-white">
              <div className="flex items-center gap-3">
                <Badge className="bg-white text-[#C9A44A] text-lg px-3 py-1">✍️</Badge>
                <CardTitle className="text-2xl">{t?.signatures || 'Signaturer'}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="electricianSignature" className="text-base font-semibold mb-2 block">
                    {t?.electricianSignature || 'Elektrikerens signatur'}
                  </Label>
                  <Input
                    id="electricianSignature"
                    value={formData.electricianSignature}
                    onChange={(e) => handleInputChange('electricianSignature', e.target.value)}
                    className="border-2 focus:border-[#C9A44A]"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="customerSignature" className="text-base font-semibold mb-2 block">
                    {t?.customerSignature || 'Kundens signatur'}
                  </Label>
                  <Input
                    id="customerSignature"
                    value={formData.customerSignature}
                    onChange={(e) => handleInputChange('customerSignature', e.target.value)}
                    className="border-2 focus:border-[#C9A44A]"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="bg-[#C9A44A] hover:bg-[#B8934A] text-white text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t?.submitting || 'Skickar...'}
                </>
              ) : (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  {t?.submitForm || 'Skicka formulär'}
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
       {/* Footer */}
      <footer className="bg-gradient-to-r from-[#2C3E50] to-[#34495E] text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">© 2025 Solpulsen Energy Norden AB</p>
        </div>
      </footer>
    </div>
  )
}

export default EgenkontrollForm