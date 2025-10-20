import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Camera, Check, Globe, ChevronDown, ChevronUp } from 'lucide-react'

const Installation = () => {
  const [language, setLanguage] = useState('sv')
  const [expandedSections, setExpandedSections] = useState({
    project: true,
    section1: false,
    section2: false,
    section3: false,
    section4: false,
    section5: false,
    section6: false,
    section7: false
  })

  const [formData, setFormData] = useState({
    customerName: '',
    address: '',
    projectNumber: '',
    date: new Date().toISOString().split('T')[0],
    installerName: '',
    supervisor: '',
    section1: {
      roofInspected: false,
      fixingsChecked: false,
      weatherChecked: false,
      toolsInspected: false,
      safetyUsed: false,
      notes: '',
      photos: []
    },
    section2: {
      railsAligned: false,
      fixingsLoadBearing: false,
      sealingsInstalled: false,
      boltsTightened: false,
      notes: '',
      photos: []
    },
    section3: {
      panelsFixed: false,
      evenAlignment: false,
      noDamagedCables: false,
      serialNumbersDocumented: false,
      notes: '',
      photos: []
    },
    section4: {
      cablesSized: false,
      mc4Crimped: false,
      dcIsolatorInstalled: false,
      cablePathsProtected: false,
      notes: '',
      photos: []
    },
    section5: {
      weatherChecked: false,
      workPausedWind: false,
      ppeUsed: false,
      notes: '',
      photos: []
    },
    section6: {
      allPanelsFixed: false,
      allCablesMarked: false,
      roofSealed: false,
      areaCleaned: false,
      documentationHandedOver: false,
      notes: '',
      photos: []
    },
    installerSignature: '',
    supervisorSignature: ''
  })

  const translations = {
    sv: {
      title: 'Egenkontroll - Solpanelsinstallation',
      subtitle: 'Solpulsen Energy Norden AB',
      languageToggle: 'English',
      projectInfo: 'Projektinformation',
      customerName: 'Kundnamn',
      address: 'Adress',
      projectNumber: 'Projektnummer',
      date: 'Datum',
      installerName: 'Installatörens namn',
      supervisor: 'Arbetsledare / Platschef',
      section1Title: 'Avsnitt 1 - Förberedelse (Före Installation)',
      section1Items: [
        'Tak inspekterat och bekräftat säkert',
        'Fästanordningar och skenor kontrollerade',
        'Väder kontrollerat (ingen kraftig vind/regn)',
        'Verktyg inspekterade',
        'Säkerhetssele och PPE använt'
      ],
      section2Title: 'Avsnitt 2 - Montering av Skenor',
      section2Items: [
        'Skenor raka och justerade enligt ritning',
        'Fästanordningar i bärande delar',
        'Tätningar korrekt installerade',
        'Alla bultar åtdragna till korrekt moment'
      ],
      section3Title: 'Avsnitt 3 - Montering av Solpaneler',
      section3Items: [
        'Paneler säkert fästa',
        'Jämn justering och lutning',
        'Inga skadade kablar under paneler',
        'Serienummer dokumenterade'
      ],
      section4Title: 'Avsnitt 4 - DC-Installation',
      section4Items: [
        'Kablar korrekt dimensionerade och märkta (+/–)',
        'MC4-kontakter korrekt crimpade',
        'DC-frånskiljare installerad',
        'Kabelvägar korta och skyddade (UV, friktion)'
      ],
      section5Title: 'Avsnitt 5 - Väder & Säkerhet',
      section5Items: [
        'Väderförhållanden kontrollerade före arbete',
        'Arbete pausat vid kraftig vind (>10 m/s)',
        'PPE och säkerhetslinor korrekt använda'
      ],
      section6Title: 'Avsnitt 6 - Slutkontroll',
      section6Items: [
        'Alla paneler fästa och säkra',
        'Alla kablar märkta',
        'Tak tätat och vattentätt',
        'Område städat och skräp borttaget',
        'Dokumentation överlämnad till elektriker'
      ],
      section7Title: 'Avsnitt 7 - Signering',
      notes: 'Anteckningar',
      photoUpload: 'Ladda upp foton',
      installerSignature: 'Installatörens signatur',
      supervisorSignature: 'Arbetsledarens signatur',
      submit: 'Skicka in formulär',
      confirmationMessage: 'Tack! Din egenkontroll har sparats.'
    },
    en: {
      title: 'Quality Control - Solar Panel Installation',
      subtitle: 'Solpulsen Energy Norden AB',
      languageToggle: 'Svenska',
      projectInfo: 'Project Information',
      customerName: 'Customer Name',
      address: 'Address',
      projectNumber: 'Project Number',
      date: 'Date',
      installerName: 'Installer Name',
      supervisor: 'Supervisor / Site Manager',
      section1Title: 'Section 1 - Preparation (Before Installation)',
      section1Items: [
        'Roof inspected and confirmed safe',
        'Fixings and rails checked',
        'Weather checked (no heavy wind/rain)',
        'Tools inspected',
        'Safety harness and PPE used'
      ],
      section2Title: 'Section 2 - Mounting Rails',
      section2Items: [
        'Rails straight and aligned per drawing',
        'Fixings in load-bearing parts',
        'Sealings properly installed',
        'All bolts tightened to torque'
      ],
      section3Title: 'Section 3 - Mounting Solar Panels',
      section3Items: [
        'Panels securely fixed',
        'Even alignment and tilt',
        'No damaged cables under panels',
        'Serial numbers documented'
      ],
      section4Title: 'Section 4 - DC Installation',
      section4Items: [
        'Cables correctly sized and marked (+/–)',
        'MC4 connectors correctly crimped',
        'DC isolator installed',
        'Cable paths short and protected (UV, friction)'
      ],
      section5Title: 'Section 5 - Weather & Safety',
      section5Items: [
        'Weather conditions checked before work',
        'Work paused during heavy wind (>10 m/s)',
        'PPE and safety lines used correctly'
      ],
      section6Title: 'Section 6 - Final Check',
      section6Items: [
        'All panels fixed and secure',
        'All cables marked',
        'Roof sealed and watertight',
        'Area cleaned and debris removed',
        'Documentation handed to electrician'
      ],
      section7Title: 'Section 7 - Sign-Off',
      notes: 'Notes',
      photoUpload: 'Upload Photos',
      installerSignature: 'Installer Signature',
      supervisorSignature: 'Supervisor Signature',
      submit: 'Submit Form',
      confirmationMessage: 'Thank you! Your quality control has been saved.'
    }
  }

  // Säkerställ att vi alltid har en giltig translation
  const getTranslation = () => {
    return translations[language] || translations.sv
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

  const handleSectionInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handlePhotoUpload = (section, event) => {
    const files = Array.from(event.target.files)
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        photos: [...prev[section].photos, ...files]
      }
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    alert(t.confirmationMessage)
  }

  // Hjälpfunktion för att rendera en sektion
  const renderSection = (sectionKey, sectionNumber, title, items, fieldNames) => {
    return (
      <Card className="border-2 border-[#C9A44A]/30 shadow-lg">
        <CardHeader 
          className="cursor-pointer bg-gradient-to-r from-[#C9A44A]/10 to-[#C9A44A]/5"
          onClick={() => toggleSection(sectionKey)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[#C9A44A] text-white flex items-center justify-center text-sm font-bold">
                {sectionNumber}
              </span>
              {title}
            </CardTitle>
            {expandedSections[sectionKey] ? <ChevronUp /> : <ChevronDown />}
          </div>
        </CardHeader>
        {expandedSections[sectionKey] && (
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-3">
              {items.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleCheckboxChange(sectionKey, fieldNames[index])}
                >
                  <Checkbox
                    id={`${sectionKey}-${index}`}
                    checked={formData[sectionKey][fieldNames[index]]}
                    className="data-[state=checked]:bg-[#C9A44A] data-[state=checked]:border-[#C9A44A]"
                  />
                  <Label htmlFor={`${sectionKey}-${index}`} className="cursor-pointer flex-1">
                    {item}
                  </Label>
                </div>
              ))}
            </div>
            <div>
              <Label htmlFor={`${sectionKey}-notes`}>{t.notes}</Label>
              <Textarea
                id={`${sectionKey}-notes`}
                value={formData[sectionKey].notes}
                onChange={(e) => handleSectionInputChange(sectionKey, 'notes', e.target.value)}
                className="border-gray-300 focus:border-[#C9A44A] focus:ring-[#C9A44A]"
                rows={3}
              />
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                {t.photoUpload}
              </Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handlePhotoUpload(sectionKey, e)}
                className="border-gray-300 focus:border-[#C9A44A] focus:ring-[#C9A44A]"
              />
              {formData[sectionKey].photos.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {formData[sectionKey].photos.length} {language === 'sv' ? 'foto(n) uppladdade' : 'photo(s) uploaded'}
                </p>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#C9A44A] rounded-full flex items-center justify-center text-white font-bold">
              SP
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t.title}</h1>
              <p className="text-sm text-gray-300">{t.subtitle}</p>
            </div>
          </div>
          <Button
            onClick={() => setLanguage(language === 'sv' ? 'en' : 'sv')}
            variant="outline"
            className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Globe className="w-4 h-4" />
            {t.languageToggle}
          </Button>
        </div>
      </header>

      {/* Main Form */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Project Information */}
          <Card className="border-2 border-[#C9A44A]/30 shadow-lg">
            <CardHeader 
              className="cursor-pointer bg-gradient-to-r from-[#C9A44A]/10 to-[#C9A44A]/5"
              onClick={() => toggleSection('project')}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-[#C9A44A] text-white flex items-center justify-center text-sm font-bold">1</span>
                  {t.projectInfo}
                </CardTitle>
                {expandedSections.project ? <ChevronUp /> : <ChevronDown />}
              </div>
            </CardHeader>
            {expandedSections.project && (
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName">{t.customerName}</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      required
                      className="border-gray-300 focus:border-[#C9A44A] focus:ring-[#C9A44A]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">{t.address}</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      required
                      className="border-gray-300 focus:border-[#C9A44A] focus:ring-[#C9A44A]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="projectNumber">{t.projectNumber}</Label>
                    <Input
                      id="projectNumber"
                      value={formData.projectNumber}
                      onChange={(e) => handleInputChange('projectNumber', e.target.value)}
                      placeholder="SP-2025-"
                      required
                      className="border-gray-300 focus:border-[#C9A44A] focus:ring-[#C9A44A]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">{t.date}</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      required
                      className="border-gray-300 focus:border-[#C9A44A] focus:ring-[#C9A44A]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="installerName">{t.installerName}</Label>
                    <Input
                      id="installerName"
                      value={formData.installerName}
                      onChange={(e) => handleInputChange('installerName', e.target.value)}
                      required
                      className="border-gray-300 focus:border-[#C9A44A] focus:ring-[#C9A44A]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="supervisor">{t.supervisor}</Label>
                    <Input
                      id="supervisor"
                      value={formData.supervisor}
                      onChange={(e) => handleInputChange('supervisor', e.target.value)}
                      required
                      className="border-gray-300 focus:border-[#C9A44A] focus:ring-[#C9A44A]"
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Render sections */}
          {renderSection('section1', 2, t.section1Title, t.section1Items, ['roofInspected', 'fixingsChecked', 'weatherChecked', 'toolsInspected', 'safetyUsed'])}
          {renderSection('section2', 3, t.section2Title, t.section2Items, ['railsAligned', 'fixingsLoadBearing', 'sealingsInstalled', 'boltsTightened'])}
          {renderSection('section3', 4, t.section3Title, t.section3Items, ['panelsFixed', 'evenAlignment', 'noDamagedCables', 'serialNumbersDocumented'])}
          {renderSection('section4', 5, t.section4Title, t.section4Items, ['cablesSized', 'mc4Crimped', 'dcIsolatorInstalled', 'cablePathsProtected'])}
          {renderSection('section5', 6, t.section5Title, t.section5Items, ['weatherChecked', 'workPausedWind', 'ppeUsed'])}
          {renderSection('section6', 7, t.section6Title, t.section6Items, ['allPanelsFixed', 'allCablesMarked', 'roofSealed', 'areaCleaned', 'documentationHandedOver'])}

          {/* Section 7 - Sign-Off */}
          <Card className="border-2 border-[#C9A44A]/30 shadow-lg">
            <CardHeader 
              className="cursor-pointer bg-gradient-to-r from-[#C9A44A]/10 to-[#C9A44A]/5"
              onClick={() => toggleSection('section7')}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-[#C9A44A] text-white flex items-center justify-center text-sm font-bold">8</span>
                  {t.section7Title}
                </CardTitle>
                {expandedSections.section7 ? <ChevronUp /> : <ChevronDown />}
              </div>
            </CardHeader>
            {expandedSections.section7 && (
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label htmlFor="installerSignature">{t.installerSignature}</Label>
                  <Input
                    id="installerSignature"
                    value={formData.installerSignature}
                    onChange={(e) => handleInputChange('installerSignature', e.target.value)}
                    placeholder={language === 'sv' ? 'Skriv ditt namn' : 'Type your name'}
                    required
                    className="border-gray-300 focus:border-[#C9A44A] focus:ring-[#C9A44A]"
                  />
                </div>
                <div>
                  <Label htmlFor="supervisorSignature">{t.supervisorSignature}</Label>
                  <Input
                    id="supervisorSignature"
                    value={formData.supervisorSignature}
                    onChange={(e) => handleInputChange('supervisorSignature', e.target.value)}
                    placeholder={language === 'sv' ? 'Skriv ditt namn' : 'Type your name'}
                    required
                    className="border-gray-300 focus:border-[#C9A44A] focus:ring-[#C9A44A]"
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <Button
              type="submit"
              size="lg"
              className="bg-gradient-to-r from-[#C9A44A] to-[#B8934A] hover:from-[#B8934A] hover:to-[#A8834A] text-white font-bold px-12 py-6 text-lg shadow-xl"
            >
              <Check className="w-5 h-5 mr-2" />
              {t.submit}
            </Button>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">© 2025 Solpulsen Energy Norden AB</p>
        </div>
      </footer>
    </div>
  )
}

export default Installation