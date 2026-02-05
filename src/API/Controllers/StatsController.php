<?php

namespace MembersForge\API\Controllers;

class StatsController
{

    const CACHE_KEY = 'members_forge_dashboard_stats';
    
    public function get_stats()
    {

        $cached_stats = get_transient( self::CACHE_KEY );

        if (false !== $cached_stats) {
            return rest_ensure_response( $cached_stats );
        }

        $data = [
            'active_members' => 1248,
            'total_revenue'  => 24590,
            'churn_rate'     => 2.4,
            'avg_ltv'        => 420,
            'growth_rate'    => 12.5,
            'cached_at'      => current_time( 'mysql' )
        ];

        set_transient( self::CACHE_KEY, $data, HOUR_IN_SECONDS );

        return rest_ensure_response( $data );
    }
}
