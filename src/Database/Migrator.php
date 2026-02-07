<?php
namespace MembersForge\Database;

class Migrator {

    public static function migrate(){
        global $wpdb;

        $charset = $wpdb->get_charset_collate();

        // Level Table
        $table_levels = $wpdb->prefix . "members_forge_levels";

        $sql_levels = "CREATE TABLE $table_levels (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            name varchar(100) NOT NULL,
            slug varchar(100) NOT NULL,
            description text DEFAULT '',
            price decimal(10,2) DEFAULT '0.00',
            billing_type varchar(20) DEFAULT 'one_time', 
            billing_interval varchar(20) DEFAULT 'month',
            billing_period int(5) DEFAULT 1,
            trial_days int(5) DEFAULT 0,
            status varchar(20) DEFAULT 'active',
            priority int(5) DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY slug (slug)
        ) $charset;";


        // Level Meta Table
        $table_levelmeta = $wpdb->prefix . 'members_forge_levelmeta';
        $sql_levelmeta = "CREATE TABLE $table_levelmeta (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            level_id bigint(20) NOT NULL,
            meta_key varchar(255) DEFAULT '',
            meta_value longtext,
            PRIMARY KEY  (id),
            KEY level_id (level_id),
            KEY meta_key (meta_key)
        ) $charset;";

        require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );

        dbDelta( $sql_levels );
        dbDelta( $sql_levelmeta );

        update_option( 'members_forge_db_version', '1.0.0' );
    }
}