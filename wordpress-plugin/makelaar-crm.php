<?php
/**
 * Plugin Name: Makelaar CRM Integration
 * Description: Display properties from Makelaar CRM
 * Version: 1.0.0
 */

class MakelaarCRM {
    private $api_base = 'https://your-app.vercel.app/api/v1/';
    private $tenant;
    private $api_key;
    
    public function __construct() {
        $this->tenant = get_option('mcrm_tenant', 'demo');
        $this->api_key = get_option('mcrm_api_key', '');
        
        add_shortcode('mcrm_properties', [$this, 'properties_shortcode']);
        add_action('admin_menu', [$this, 'admin_menu']);
    }
    
    public function properties_shortcode($atts) {
        $properties = $this->get_properties();
        
        $html = '<div class="mcrm-properties">';
        foreach ($properties as $property) {
            $html .= sprintf(
                '<div class="mcrm-property">
                    <h3>%s</h3>
                    <p>%s - %d bedrooms</p>
                    <p><strong>€%s</strong></p>
                </div>',
                esc_html($property->title),
                esc_html($property->city),
                intval($property->bedrooms),
                number_format($property->price, 0, ',', '.')
            );
        }
        $html .= '</div>';
        
        return $html;
    }
    
    private function get_properties() {
        $response = wp_remote_get($this->api_base . $this->tenant . '/properties', [
            'headers' => ['X-API-Key' => $this->api_key]
        ]);
        
        if (is_wp_error($response)) {
            return [];
        }
        
        $body = json_decode(wp_remote_retrieve_body($response));
        return $body->data ?? [];
    }
    
    public function admin_menu() {
        add_menu_page(
            'Makelaar CRM',
            'Makelaar CRM',
            'manage_options',
            'makelaar-crm',
            [$this, 'admin_page']
        );
    }
    
    public function admin_page() {
        if (isset($_POST['submit'])) {
            update_option('mcrm_tenant', sanitize_text_field($_POST['tenant']));
            update_option('mcrm_api_key', sanitize_text_field($_POST['api_key']));
            echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
        }
        ?>
        <div class="wrap">
            <h1>Makelaar CRM Settings</h1>
            <form method="post">
                <table class="form-table">
                    <tr>
                        <th>Tenant Slug</th>
                        <td><input type="text" name="tenant" value="<?php echo esc_attr(get_option('mcrm_tenant')); ?>" /></td>
                    </tr>
                    <tr>
                        <th>API Key</th>
                        <td><input type="password" name="api_key" value="<?php echo esc_attr(get_option('mcrm_api_key')); ?>" /></td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }
}

new MakelaarCRM();
