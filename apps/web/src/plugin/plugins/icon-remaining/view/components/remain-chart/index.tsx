import React from 'react';
import * as Icons from '@milesight/shared/src/components/icons';
import { useTheme } from '@milesight/shared/src/hooks';
import './style.less';

interface IProps {
    Icon: any;
    iconColor: string;
    percent: number;
}
export default React.memo(({ Icon, iconColor, percent }: IProps) => {
    const { blue } = useTheme();

    const RenderIcon = Icon || Icons.DeleteIcon;
    const renderIconColor = iconColor || blue[700];
    return (
        <div className="ms-remain-chart">
            <div className="ms-remain-chart__percent">{percent}%</div>
            {RenderIcon && (
                <div className="ms-remain-chart__content">
                    <RenderIcon sx={{ color: renderIconColor }} className="ms-remain-chart__icon" />
                    <div className="ms-remain-chart__mask">
                        <RenderIcon
                            className="ms-remain-chart__mask-icon"
                            sx={{ color: renderIconColor }}
                            // @ts-ignore
                            style={{ 'clip-path': `inset(${100 - (percent || 0)}% 0 0 0)` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
});
