<?php
/**
 * Minimal Working Config for Solpulsen
 * Save as config.php in your project root
 */

return [
    // Database Configuration
    'database' => [
        'host' => 'crm.solpulsen.se',
        'port' => 3306,
        'database' => 'pulsen_suitecrm',
        'username' => 'pulsen_suitecrm',
        'password' => 'I%XShyxikg7n3$q0',
        'charset' => 'utf8mb4'
    ],
    
    // Lead Sources Configuration
    'lead_sources' => [
        'facebook_leads' => [
            'source_name' => 'Facebook',
            'brand_color' => '#1877f2',
            'default_assigned_to' => 19,
            'default_status' => 'New',
            'default_customer_type' => 'Individual',
            'default_customers_status' => 'Potential',
            'default_source' => 'facebook',
            'default_interest_areas' => ['Solceller'],
            'default_rating' => null,
            'enable_urgent_notifications' => true,
            'email_recipients' => [
                'primary' => [
                    /*'sales@solpulsen.se',
                    'info@solpulsen.se'*/
                    'olsen.sweden@gmail.com',
                  /*  'info@solpulsen.se',
                    'dino@solpulsen.se', */
                ],
                'cc' => [],
                'bcc' => []
            ]
        ]
    ],
    
    // SMTP Email Configuration
    
    'smtp' => [
        'host' => 'prime6.inleed.net',
        'port' => 587,
        'username' => 'noreply@solpulsen.se',
        'password' => 'jXtj7RDRu72pdUXqxHC3',
        'secure' => 'tls',
        'from_email' => 'noreply@solpulsen.se',
        'from_name' => 'Solpulsen CRM',
        'debug' => false,
    ], 
    
    
    // Business Hours
    'business_hours' => [
        'start' => 8,
        'end' => 17,
        'timezone' => 'Europe/Stockholm'
    ],
    
    // App Settings
    'app' => [
        'name' => 'Solpulsen CRM',
        'version' => '1.0.0',
        'environment' => 'development',
        'timezone' => 'Europe/Stockholm'
    ]
];