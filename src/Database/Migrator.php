<?php
namespace MembersForge\Database;

class Migrator {

    public static function migrate(){
        global $wpdb;

        $charset = $wpdb->get_charset_collate();

        // Level Table and Level Meta Table
        $sql_levels = self::get_schema_members_levels($wpdb->prefix, $charset);
        $sql_levelmeta = self::get_schema_levelmeta($wpdb->prefix, $charset);

        // Memberships and Members Meta Table
        $sql_memberships = self::get_schema_memberships($wpdb->prefix, $charset);
        $sql_member_meta = self::get_schema_membersmeta($wpdb->prefix, $charset);

        // Form Table
        $sql_forms = self::get_schema_forms($wpdb->prefix, $charset);

        if ( defined( 'ABSPATH' ) ) {
            require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        }

        // Create Levels and Level meta table
        dbDelta( $sql_levels );
        dbDelta( $sql_levelmeta );

        // Create Memnerships and Members meta table
        dbDelta( $sql_memberships );
        dbDelta( $sql_member_meta );

        // Create Form table
        dbDelta( $sql_forms );

        update_option( 'members_forge_db_version', '1.3.0' );
    }

    /**
     * Schema for members_levels table
     * @param $prefix, $charset
     * @return string
     */
    private static function get_schema_members_levels( $prefix, $charset ): string{
        $table_levels = $prefix . "members_forge_levels";

        $sql= "CREATE TABLE $table_levels (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            name varchar(100) NOT NULL,
            slug varchar(100) NOT NULL,
            description text,
            price decimal(10,2) DEFAULT '0.00',
            billing_type varchar(20) DEFAULT 'one_time', 
            billing_interval varchar(20) DEFAULT 'month',
            billing_period int(5) DEFAULT 1,
            trial_days int(5) DEFAULT 0,
            is_free TINYINT(1) DEFAULT 0,
            max_members BIGINT(20) DEFAULT 0,
            features varchar(500) NULL,
            status varchar(20) DEFAULT 'active',
            priority int(5) DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY slug (slug)
        ) $charset;";

        return $sql;
    }

    /**
     * Schema for levelmeta table
     * @param $prefix, $charset
     * @return string
     */
    private static function get_schema_levelmeta( $prefix, $charset ):  string{
        $table_levelmeta = $prefix . 'members_forge_levelmeta';
        $sql = "CREATE TABLE $table_levelmeta (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            level_id bigint(20) NOT NULL,
            meta_key varchar(255) DEFAULT '',
            meta_value longtext,
            PRIMARY KEY  (id),
            KEY level_id (level_id),
            KEY meta_key (meta_key)
        ) $charset;";

        return $sql;
    }

    /**
     * Schema for memberships table
     * @param $prefix, $charset
     * @return string
     */
    private static function get_schema_memberships( $prefix, $charset ): string{
        $table = $prefix . 'members_forge_memberships';

        $sql = "CREATE TABLE $table (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            level_id bigint(20) NOT NULL,
            status varchar(20) DEFAULT 'pending',
            started_at datetime DEFAULT CURRENT_TIMESTAMP,
            expires_at datetime DEFAULT NULL,
            trial_ends_at datetime DEFAULT NULL,
            cancelled_at datetime DEFAULT NULL,
            amount_paid decimal(10,2) DEFAULT '0.00',
            currency varchar(3) DEFAULT 'USD',
            payment_gateway varchar(50) DEFAULT '',
            transaction_id varchar(100) DEFAULT '',
            next_billing_date datetime DEFAULT NULL,
            notes text DEFAULT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY user_id (user_id),
            KEY level_id (level_id),
            KEY status (status)
        ) $charset;";

        return $sql;
    }

    /**
     * Schema for member_meta table
     * @param $prefix, $charset
     * @return string
     */
    private static function get_schema_membersmeta( $prefix, $charset ): string{
        $table = $prefix . 'members_forge_member_meta';

        $sql = "CREATE TABLE $table (
            meta_id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            meta_key varchar(255) DEFAULT '',
            meta_value longtext,
            PRIMARY KEY  (meta_id),
            KEY user_id (user_id),
            KEY meta_key (meta_key)
        ) $charset;";

        return $sql;
    }

    /**
     * Schema for members_forge_forms table
     * @param $prefix, $charset
     * @return string
     */
    private static function get_schema_forms( $prefix, $charset ): string {
        $table = $prefix . 'members_forge_forms';

        $sql = "CREATE TABLE {$table} (
            id BIGINT(20) NOT NULL AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            type VARCHAR(50) NOT NULL,
            fields LONGTEXT,
            settings LONGTEXT,
            shortcode_key VARCHAR(100) NOT NULL,
            status VARCHAR(20) DEFAULT 'draft',
            schema_version INT(11) DEFAULT 1,
            created_by BIGINT(20) DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY type (type),
            KEY status (status),
            UNIQUE KEY shortcode_key (shortcode_key),
            KEY created_by (created_by)
        ) {$charset};";

        return $sql;
    }
}