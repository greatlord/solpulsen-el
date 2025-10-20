<?php
require_once __DIR__ . '/../db/database.php';

class InstallationModel {
    private $db;

    public function __construct() {
        $this->db = (new Database())->getPDO();
    }

    public function findAll() {
        $stmt = $this->db->query("
            SELECT * FROM installations 
            ORDER BY created_at DESC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function find($id) {
        $stmt = $this->db->prepare("SELECT * FROM installations WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findWithDetails($id) {
        // Get main installation data
        $installation = $this->find($id);
        if (!$installation) {
            return null;
        }

        // Get all sections with their data
        $sections = $this->getInstallationSections($id);
        
        // Get all photos for the installation
        $photos = $this->getInstallationPhotos($id);

        // Get signatures
        $signatures = $this->getInstallationSignatures($id);

        // Structure the data to match the React form
        $formData = [
            'id' => $installation['id'],
            'customerName' => $installation['customer_name'],
            'address' => $installation['address'],
            'projectNumber' => $installation['project_number'],
            'date' => $installation['date'],
            'installerName' => $installation['installer_name'],
            'supervisor' => $installation['supervisor'],
            'installerSignature' => $this->getSignatureByType($signatures, 'installer'),
            'supervisorSignature' => $this->getSignatureByType($signatures, 'supervisor'),
            'created_at' => $installation['created_at']
        ];

        // Add section data
        foreach ($sections as $section) {
            $sectionNumber = $section['section_number'];
            $formData["section{$sectionNumber}"] = $this->mapSectionToForm($section);
        }

        // Add photos to sections
        foreach ($photos as $photo) {
            $sectionNumber = $photo['section_number'];
            if (!isset($formData["section{$sectionNumber}"]['photos'])) {
                $formData["section{$sectionNumber}"]['photos'] = [];
            }
            $formData["section{$sectionNumber}"]['photos'][] = [
                'id' => $photo['id'],
                'filename' => $photo['filename'],
                'mime_type' => $photo['mime_type'],
                'data_url' => 'data:' . $photo['mime_type'] . ';base64,' . base64_encode($photo['photo'])
            ];
        }

        return $formData;
    }

    private function getInstallationSections($installationId) {
        $stmt = $this->db->prepare("
            SELECT * FROM installation_sections 
            WHERE installation_id = :installation_id 
            ORDER BY section_number
        ");
        $stmt->execute(['installation_id' => $installationId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function getInstallationPhotos($installationId) {
        $stmt = $this->db->prepare("
            SELECT ip.*, isec.section_number 
            FROM installation_photos ip
            JOIN installation_sections isec ON ip.section_id = isec.id
            WHERE isec.installation_id = :installation_id
            ORDER BY isec.section_number, ip.uploaded_at
        ");
        $stmt->execute(['installation_id' => $installationId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function getInstallationSignatures($installationId) {
        $stmt = $this->db->prepare("
            SELECT * FROM installation_signatures 
            WHERE installation_id = :installation_id
        ");
        $stmt->execute(['installation_id' => $installationId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function getSignatureByType($signatures, $type) {
        foreach ($signatures as $signature) {
            if ($signature['type'] === $type) {
                return $signature['signature_image'] ? base64_encode($signature['signature_image']) : null;
            }
        }
        return null;
    }

    private function mapSectionToForm($section) {
        $sectionData = [
            'notes' => $section['notes'] ?? ''
        ];

        // Map all TINYINT fields based on section number
        $fieldMappings = $this->getSectionFieldMappings($section['section_number']);
        
        foreach ($fieldMappings as $formField => $dbField) {
            $sectionData[$formField] = (bool)$section[$dbField];
        }

        return $sectionData;
    }

    private function getSectionFieldMappings($sectionNumber) {
        $mappings = [
            1 => [ // Preparation and Safety
                'roofInspected' => 'roof_inspected',
                'fixingsChecked' => 'fixings_checked',
                'weatherChecked' => 'weather_checked',
                'toolsInspected' => 'tools_inspected',
                'safetyUsed' => 'safety_used'
            ],
            2 => [ // Rail Installation
                'railsAligned' => 'rails_aligned',
                'fixingsLoadBearing' => 'fixings_load_bearing',
                'sealingsInstalled' => 'sealings_installed',
                'boltsTightened' => 'bolts_tightened'
            ],
            3 => [ // Panel Installation
                'panelsFixed' => 'panels_fixed',
                'evenAlignment' => 'even_alignment',
                'noDamagedCables' => 'no_damaged_cables',
                'serialNumbersDocumented' => 'serial_numbers_documented'
            ],
            4 => [ // Cable Installation
                'cablesSized' => 'cables_sized',
                'mc4Crimped' => 'mc4_crimped',
                'dcIsolatorInstalled' => 'dc_isolator_installed',
                'cablePathsProtected' => 'cable_paths_protected'
            ],
            5 => [ // Weather and Safety
                'weatherCheckedSection5' => 'weather_checked_section5',
                'workPausedWind' => 'work_paused_wind',
                'ppeUsed' => 'ppe_used'
            ],
            6 => [ // Final Check
                'allPanelsFixed' => 'all_panels_fixed',
                'allCablesMarked' => 'all_cables_marked',
                'roofSealed' => 'roof_sealed',
                'areaCleaned' => 'area_cleaned',
                'documentationHandedOver' => 'documentation_handed_over'
            ]
        ];

        return $mappings[$sectionNumber] ?? [];
    }

    public function createWithDetails($input) {
        try {
            $this->db->beginTransaction();

            // 1. Insert main installation record
            $installationId = $this->createInstallation($input);
            
            // 2. Insert all 6 sections
            $sectionIds = [];
            for ($i = 1; $i <= 6; $i++) {
                $sectionId = $this->createSection($installationId, $i, $input["section{$i}"] ?? []);
                $sectionIds[$i] = $sectionId;
                
                // 3. Insert photos for this section if any
                if (isset($input["section{$i}"]['photos']) && is_array($input["section{$i}"]['photos'])) {
                    foreach ($input["section{$i}"]['photos'] as $photoData) {
                        $this->addPhoto($sectionId, $photoData);
                    }
                }
            }

            // 4. Store signatures in installation_signatures table if provided
            if (!empty($input['installerSignature'])) {
                $this->addSignature($installationId, 'installer', $input['installerSignature']);
            }
            if (!empty($input['supervisorSignature'])) {
                $this->addSignature($installationId, 'supervisor', $input['supervisorSignature']);
            }

            $this->db->commit();
            return $installationId;

        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    private function createInstallation($data) {
        $sql = "INSERT INTO installations (
            customer_name, address, project_number, date,
            installer_name, supervisor
        ) VALUES (
            :customer_name, :address, :project_number, :date,
            :installer_name, :supervisor
        )";

        $stmt = $this->db->prepare($sql);
        
        $stmt->execute([
            'customer_name' => $data['customerName'],
            'address' => $data['address'],
            'project_number' => $data['projectNumber'],
            'date' => $data['date'],
            'installer_name' => $data['installerName'],
            'supervisor' => $data['supervisor']
        ]);

        return $this->db->lastInsertId();
    }

    private function createSection($installationId, $sectionNumber, $sectionData) {
        $fieldMappings = $this->getSectionFieldMappings($sectionNumber);
        
        // Build SQL with dynamic fields
        $dbFields = ['installation_id', 'section_number', 'section_name', 'notes'];
        $placeholders = [':installation_id', ':section_number', ':section_name', ':notes'];
        $params = [
            'installation_id' => $installationId,
            'section_number' => $sectionNumber,
            'section_name' => $this->getSectionName($sectionNumber),
            'notes' => $sectionData['notes'] ?? ''
        ];

        // Add the boolean fields for this section
        foreach ($fieldMappings as $formField => $dbField) {
            $dbFields[] = $dbField;
            $placeholders[] = ":{$dbField}";
            $params[$dbField] = isset($sectionData[$formField]) && $sectionData[$formField] ? 1 : 0;
        }

        $sql = "INSERT INTO installation_sections (" . 
               implode(', ', $dbFields) . 
               ") VALUES (" . 
               implode(', ', $placeholders) . 
               ")";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return $this->db->lastInsertId();
    }

    private function getSectionName($sectionNumber) {
        $names = [
            1 => 'Takinspektion och Förberedelse',
            2 => 'Montering av Railsystem',
            3 => 'Montering av Solpaneler',
            4 => 'Kabeldragning och Anslutning',
            5 => 'Väder och Säkerhet',
            6 => 'Slutkontroll och Dokumentation'
        ];
        
        return $names[$sectionNumber] ?? "Section $sectionNumber";
    }

    private function addPhoto($sectionId, $photoData) {
        $sql = "INSERT INTO installation_photos (
            section_id, photo, filename, mime_type
        ) VALUES (
            :section_id, :photo, :filename, :mime_type
        )";

        $stmt = $this->db->prepare($sql);
        
        // Decode base64 image data
        $imageBinary = $this->processImageData($photoData['data'] ?? '');
        
        $stmt->execute([
            'section_id' => $sectionId,
            'photo' => $imageBinary,
            'filename' => $photoData['name'] ?? 'unknown',
            'mime_type' => $photoData['type'] ?? 'image/jpeg'
        ]);

        return $this->db->lastInsertId();
    }

    private function processImageData($imageData) {
        if (empty($imageData)) {
            return null;
        }
        
        // If it's base64 data URL, extract the binary data
        if (strpos($imageData, 'data:') === 0) {
            $parts = explode(',', $imageData);
            if (count($parts) === 2) {
                return base64_decode($parts[1]);
            }
        }
        
        // Assume it's already base64 encoded binary data
        if (base64_decode($imageData, true) !== false) {
            return base64_decode($imageData);
        }
        
        // Assume it's already binary data
        return $imageData;
    }

    private function addSignature($installationId, $type, $signatureData) {
        $sql = "INSERT INTO installation_signatures (
            installation_id, type, signature_text, signature_image
        ) VALUES (
            :installation_id, :type, :signature_text, :signature_image
        )";

        $stmt = $this->db->prepare($sql);
        
        $signatureBinary = $this->processSignatureData($signatureData);
        
        $stmt->execute([
            'installation_id' => $installationId,
            'type' => $type,
            'signature_text' => '', // You can extract text from signature if needed
            'signature_image' => $signatureBinary
        ]);

        return $this->db->lastInsertId();
    }

    private function processSignatureData($signatureData) {
        if (empty($signatureData)) {
            return null;
        }
        
        // If it's base64 data URL, extract the binary data
        if (strpos($signatureData, 'data:') === 0) {
            $parts = explode(',', $signatureData);
            if (count($parts) === 2) {
                return base64_decode($parts[1]);
            }
        }
        
        // Assume it's already binary data
        return $signatureData;
    }

    public function getPhoto($photoId) {
        $stmt = $this->db->prepare("
            SELECT photo, mime_type, filename 
            FROM installation_photos 
            WHERE id = :id
        ");
        $stmt->execute(['id' => $photoId]);
        $photo = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($photo) {
            // Return as binary data with proper headers
            return $photo;
        }
        
        return null;
    }

    public function updateWithDetails($id, $input) {
        // Implementation for updating existing records
        // This would involve updating installations, installation_sections, and handling photo updates
        // For now, we'll focus on create functionality
        throw new Exception("Update functionality not implemented yet");
    }

    public function delete($id) {
        // Due to CASCADE constraints, deleting from installations will delete related records
        $stmt = $this->db->prepare("DELETE FROM installations WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->rowCount();
    }
}
