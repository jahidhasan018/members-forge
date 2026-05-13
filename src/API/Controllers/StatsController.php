<?php

namespace MembersForge\API\Controllers;

use MembersForge\API\AbstractController;

class StatsController extends AbstractController {

    const CACHE_KEY = 'members_forge_dashboard_stats';
    
    public function get_stats()
    {

        $cached_stats = get_transient( self::CACHE_KEY );

        if (false !== $cached_stats) {
            return $this->success_response( $cached_stats );
        }

        global $wpdb;
        $table = $wpdb->prefix . 'members_forge_memberships';

        $total = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table}" );
        $active = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table} WHERE status = 'active'" );
        $expired   = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table} WHERE status = 'expired'" );
        $cancelled = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table} WHERE status = 'cancelled'" );
        $pending   = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table} WHERE status = 'pending'" );


        $data = [
            'total_members'    => $total,
            'active_members'   => $active,
            'expired_members'  => $expired,
            'cancelled_members'=> $cancelled,
            'pending_members'  => $pending,
        ];

        set_transient( self::CACHE_KEY, $data, HOUR_IN_SECONDS );

        return $this->success_response( $data );
    }
}
