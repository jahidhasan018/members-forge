/**
 * Card Component - Reusable card with optional title and border accent
 */
const Card = ({ title, children, className = '', borderColor = '' }) => {
    return (
        <div
            className={`
                bg-white rounded-xl shadow-sm border border-slate-200 
                overflow-hidden transition-shadow hover:shadow-md
                ${borderColor ? `border-l-4 ${borderColor}` : ''}
                ${className}
            `}
        >
            {title && (
                <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-base font-semibold text-slate-800 m-0">{title}</h3>
                </div>
            )}
            <div className="p-5">
                {children}
            </div>
        </div>
    );
};

export default Card;