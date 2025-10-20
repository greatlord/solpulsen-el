<?php
require_once __DIR__ . '/../db/database.php';

class EgenkontrollModel {
    private $db;

    public function __construct() {
        $this->db = (new Database())->getPDO();
    }

    public function findAll() {
        $stmt = $this->db->query("
            SELECT * FROM project_inspections 
            ORDER BY created_at DESC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function find($id) {
        $stmt = $this->db->prepare("SELECT * FROM project_inspections WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findWithDetails($id) {
        // Get main inspection data
        $inspection = $this->find($id);
        if (!$inspection) {
            return null;
        }

        // Get all sections with their data
        $sections = $this->getInspectionSections($id);
        
        // Get all photos for the inspection
        $photos = $this->getInspectionPhotos($id);

        // Structure the data to match the React form
        $formData = [
            'id' => $inspection['id'],
            'customerName' => $inspection['customer_name'],
            'address' => $inspection['address'],
            'projectNumber' => $inspection['project_number'],
            'date' => $inspection['date'],
            'electricianName' => $inspection['electrician_name'],
            'certificationNumber' => $inspection['certification_number'],
            'electricianSignature' => $inspection['electrician_signature'] ? base64_encode($inspection['electrician_signature']) : null,
            'customerSignature' => $inspection['customer_signature'] ? base64_encode($inspection['customer_signature']) : null,
            'created_at' => $inspection['created_at']
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

    private function getInspectionSections($inspectionId) {
        $stmt = $this->db->prepare("
            SELECT * FROM inspection_sections 
            WHERE inspection_id = :inspection_id 
            ORDER BY section_number
        ");
        $stmt->execute(['inspection_id' => $inspectionId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function getInspectionPhotos($inspectionId) {
        $stmt = $this->db->prepare("
            SELECT ip.*, isec.section_number 
            FROM inspection_photos ip
            JOIN inspection_sections isec ON ip.section_id = isec.id
            WHERE isec.inspection_id = :inspection_id
            ORDER BY isec.section_number, ip.uploaded_at
        ");
        $stmt->execute(['inspection_id' => $inspectionId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
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
                'workPermitObtained' => 'work_permit_obtained',
                'safetyEquipmentChecked' => 'safety_equipment_checked',
                'voltageTestersCalibrated' => 'voltage_testers_calibrated',
                'isolationTestersAvailable' => 'isolation_testers_available',
                'personalProtectiveEquipment' => 'personal_protective_equipment'
            ],
            2 => [ // AC Cable Installation
                'cableSizeCorrect' => 'cable_size_correct',
                'cableRoutingSafe' => 'cable_routing_safe',
                'cableProtectionInstalled' => 'cable_protection_installed',
                'cableMarkingComplete' => 'cable_marking_complete',
                'fireSealsInstalled' => 'fire_seals_installed'
            ],
            3 => [ // Inverter
                'inverterMountingSecure' => 'inverter_mounting_secure',
                'inverterVentilationAdequate' => 'inverter_ventilation_adequate',
                'dcConnectionsCorrect' => 'dc_connections_correct',
                'acConnectionsCorrect' => 'ac_connections_correct',
                'groundingVerified' => 'grounding_verified',
                'inverterConfigured' => 'inverter_configured'
            ],
            4 => [ // Main Panel
                'circuitBreakerSizeCorrect' => 'circuit_breaker_size_correct',
                'rcboInstalled' => 'rcbo_installed',
                'labelingComplete' => 'labeling_complete',
                'connectionsTightened' => 'connections_tightened',
                'phasesBalanced' => 'phases_balanced'
            ],
            5 => [ // Grounding and Surge Protection
                'earthingResistanceMeasured' => 'earthing_resistance_measured',
                'earthingResistanceAcceptable' => 'earthing_resistance_acceptable',
                'surgeProtectionInstalled' => 'surge_protection_installed',
                'bondingConductorsInstalled' => 'bonding_conductors_installed',
                'lightningProtectionConnected' => 'lightning_protection_connected'
            ],
            6 => [ // Measurements and Tests
                'insulationResistanceTest' => 'insulation_resistance_test',
                'continuityTest' => 'continuity_test',
                'polarityTest' => 'polarity_test',
                'rcdTest' => 'rcd_test',
                'voltageTest' => 'voltage_test',
                'functionalTest' => 'functional_test'
            ],
            7 => [ // Documentation
                'schematicDiagramsComplete' => 'schematic_diagrams_complete',
                'installationCertificateIssued' => 'installation_certificate_issued',
                'testResultsDocumented' => 'test_results_documented',
                'userManualProvided' => 'user_manual_provided',
                'warrantyDocumentsProvided' => 'warranty_documents_provided'
            ],
            8 => [ // Final Inspection
                'systemStartedSuccessfully' => 'system_started_successfully',
                'monitoringSystemConnected' => 'monitoring_system_connected',
                'customerInstructed' => 'customer_instructed',
                'siteCleanedUp' => 'site_cleaned_up',
                'finalInspectionComplete' => 'final_inspection_complete'
            ]
        ];

        return $mappings[$sectionNumber] ?? [];
    }

    public function createWithDetails($input) {
        try {
            $this->db->beginTransaction();

            // 1. Insert main inspection record
            $inspectionId = $this->createInspection($input);
            
            // 2. Insert all 8 sections
            $sectionIds = [];
            for ($i = 1; $i <= 8; $i++) {
                $sectionId = $this->createSection($inspectionId, $i, $input["section{$i}"] ?? []);
                $sectionIds[$i] = $sectionId;
                
                // 3. Insert photos for this section if any
                if (isset($input["section{$i}"]['photos']) && is_array($input["section{$i}"]['photos'])) {
                    foreach ($input["section{$i}"]['photos'] as $photoData) {
                        $this->addPhoto($sectionId, $photoData);
                    }
                }
            }

            // 4. Store signatures in inspection_signatures table if provided
            if (!empty($input['electricianSignature'])) {
                $this->addSignature($inspectionId, 'electrician', $input['electricianSignature']);
            }
            if (!empty($input['customerSignature'])) {
                $this->addSignature($inspectionId, 'customer', $input['customerSignature']);
            }

            $this->db->commit();
            return $inspectionId;

        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    private function createInspection($data) {
        $sql = "INSERT INTO project_inspections (
            customer_name, address, project_number, date,
            electrician_name, certification_number,
            electrician_signature, customer_signature
        ) VALUES (
            :customer_name, :address, :project_number, :date,
            :electrician_name, :certification_number,
            :electrician_signature, :customer_signature
        )";

        $stmt = $this->db->prepare($sql);
        
        // Handle signature data
        $electricianSignature = $this->processSignatureData($data['electricianSignature'] ?? '');
        $customerSignature = $this->processSignatureData($data['customerSignature'] ?? '');

        $stmt->execute([
            'customer_name' => $data['customerName'],
            'address' => $data['address'],
            'project_number' => $data['projectNumber'],
            'date' => $data['date'],
            'electrician_name' => $data['electricianName'],
            'certification_number' => $data['certificationNumber'],
            'electrician_signature' => $electricianSignature,
            'customer_signature' => $customerSignature
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

    private function createSection($inspectionId, $sectionNumber, $sectionData) {
        $fieldMappings = $this->getSectionFieldMappings($sectionNumber);
        
        // Build SQL with dynamic fields
        $dbFields = ['inspection_id', 'section_number', 'section_name', 'notes'];
        $placeholders = [':inspection_id', ':section_number', ':section_name', ':notes'];
        $params = [
            'inspection_id' => $inspectionId,
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

        $sql = "INSERT INTO inspection_sections (" . 
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
            1 => 'Förberedelse och Säkerhet',
            2 => 'AC-Kabeldragning',
            3 => 'Växelriktare',
            4 => 'Huvudcentral och Inkoppling',
            5 => 'Jordning och Överspänningsskydd',
            6 => 'Mätningar och Tester',
            7 => 'Dokumentation och Certifiering',
            8 => 'Slutkontroll och Driftsättning'
        ];
        
        return $names[$sectionNumber] ?? "Section $sectionNumber";
    }

    private function addPhoto($sectionId, $photoData) {
        $sql = "INSERT INTO inspection_photos (
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

    private function addSignature($inspectionId, $type, $signatureData) {
        $sql = "INSERT INTO inspection_signatures (
            inspection_id, type, signature_text, signature_image
        ) VALUES (
            :inspection_id, :type, :signature_text, :signature_image
        )";

        $stmt = $this->db->prepare($sql);
        
        $signatureBinary = $this->processSignatureData($signatureData);
        
        $stmt->execute([
            'inspection_id' => $inspectionId,
            'type' => $type,
            'signature_text' => '', // You can extract text from signature if needed
            'signature_image' => $signatureBinary
        ]);

        return $this->db->lastInsertId();
    }

    public function getPhoto($photoId) {
        $stmt = $this->db->prepare("
            SELECT photo, mime_type, filename 
            FROM inspection_photos 
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
        // This would involve updating project_inspections, inspection_sections, and handling photo updates
        // For now, we'll focus on create functionality
        throw new Exception("Update functionality not implemented yet");
    }

    public function delete($id) {
        // Due to CASCADE constraints, deleting from project_inspections will delete related records
        $stmt = $this->db->prepare("DELETE FROM project_inspections WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->rowCount();
    }
}
