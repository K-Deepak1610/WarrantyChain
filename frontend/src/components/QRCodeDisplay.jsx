import { QRCodeCanvas } from 'qrcode.react';
import GlassCard from './GlassCard';

const QRCodeDisplay = ({ value, title = "Product QR Code" }) => {
    if (!value) return null;

    return (
        <GlassCard className="flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto">
            <h3 className="text-lg font-semibold text-blue-300">{title}</h3>
            <div className="p-4 bg-white rounded-xl">
                <QRCodeCanvas
                    value={value}
                    size={200}
                    level={"H"}
                    includeMargin={true}
                />
            </div>
            <p className="text-xs text-center text-slate-400 break-all">
                {value}
            </p>
        </GlassCard>
    );
};

export default QRCodeDisplay;
