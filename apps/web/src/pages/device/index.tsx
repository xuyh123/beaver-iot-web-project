import { Link } from 'react-router-dom';
import { Typography } from '@mui/material';
import { Breadcrumbs } from '@/components';
import './style.less';

export default () => {
    return (
        <div className="ms-main">
            <Breadcrumbs />
            <div className="ms-view ms-view-device">
                <div className="ms-view__inner">
                    <Typography variant="h3">Device</Typography>
                    <Typography>Hello World!</Typography>

                    <Link to="/device/detail">Go Device Detail</Link>
                </div>
            </div>
        </div>
    );
};
