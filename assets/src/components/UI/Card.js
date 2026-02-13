import {
    Card as WPCard,
    CardHeader,
    CardBody,
    __experimentalText as Text,
} from '@wordpress/components';

/**
 * Card Component - Wrapper around @wordpress/components Card
 * Styled with MembersForge brand via CSS overrides
 * 
 * @param {string} title - Optional card header title
 * @param {React.ReactNode} children - Card content
 * @param {string} className - Additional CSS classes
 * @param {string} borderColor - Optional left border color class (e.g., 'border-l-brand-600')
 */
const Card = ({ title, children, className = '', borderColor = '' }) => {
    return (
        <WPCard
            className={`${borderColor ? `border-l-4 ${borderColor}` : ''} ${className}`}
            size="small"
        >
            {title && (
                <CardHeader>
                    <Text weight={600}>{title}</Text>
                </CardHeader>
            )}
            <CardBody>
                {children}
            </CardBody>
        </WPCard>
    );
};

export default Card;