import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Stack } from '@mui/material';
import { useRequest } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { objectToCamelCase } from '@milesight/shared/src/utils/tools';
import { AddIcon, DeleteOutlineIcon, toast } from '@milesight/shared/src/components';
import { Breadcrumbs, TablePro, useConfirm } from '@/components';
import { deviceAPI, awaitWrap, getResponseData, isRequestSuccess } from '@/services/http';
import { useColumns, type UseColumnsProps, type TableRowDataType } from './hooks';
import { AddModal } from './components';
import './style.less';

export default () => {
    const navigate = useNavigate();
    const { getIntlText } = useI18n();

    // ---------- 列表数据相关 ----------
    const [keyword, setKeyword] = useState<string>();
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [selectedIds, setSelectedIds] = useState<readonly ApiKey[]>([]);
    const {
        data: deviceData,
        loading,
        run: getDeviceList,
    } = useRequest(
        async () => {
            const { page, pageSize } = paginationModel;
            const [error, resp] = await awaitWrap(
                deviceAPI.getList({
                    name: keyword,
                    page_size: pageSize,
                    page_number: page + 1,
                }),
            );
            const data = getResponseData(resp);

            console.log({ error, resp });
            if (error || !data || !isRequestSuccess(resp)) return;

            return objectToCamelCase(data);
        },
        {
            debounceWait: 300,
            refreshDeps: [keyword, paginationModel],
        },
    );

    // ---------- 设备添加相关 ----------
    const [modalOpen, setModalOpen] = useState(false);

    // ---------- 数据删除相关 ----------
    const confirm = useConfirm();
    const handleDeleteConfirm = useCallback(() => {
        confirm({
            title: getIntlText('common.label.delete'),
            description: getIntlText('device.message.delete_tip'),
            confirmButtonText: getIntlText('common.label.delete'),
            confirmButtonProps: {
                color: 'error',
            },
            onConfirm: async () => {
                console.log('confirm...', selectedIds);
                // TODO: 以下为临时 Mock 处理，待接口正常返回数据后调整
                // const [error, resp] = await awaitWrap(
                //     deviceAPI.deleteDevices({ device_id_list: selectedIds as ApiKey[] }),
                // );

                // if (error || !isRequestSuccess(resp)) return;
                // setSelectedIds([]);
                // toast.success(getIntlText('common.label.delete_success'));

                await new Promise(resolve => {
                    setTimeout(() => {
                        resolve(undefined);
                        setSelectedIds([]);
                        getDeviceList();
                        toast.success(getIntlText('common.message.delete_success'));
                    }, 2000);
                });
            },
        });
    }, [confirm, getIntlText, getDeviceList, selectedIds]);

    // ---------- Table 渲染相关 ----------
    const toolbarRender = useMemo(() => {
        return (
            <Stack className="ms-operations-btns" direction="row" spacing="12px">
                <Button
                    variant="contained"
                    sx={{ height: 36, textTransform: 'none' }}
                    startIcon={<AddIcon />}
                    onClick={() => setModalOpen(true)}
                >
                    {getIntlText('common.label.add')}
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    disabled={!selectedIds.length}
                    sx={{ height: 36, textTransform: 'none' }}
                    startIcon={<DeleteOutlineIcon />}
                    onClick={handleDeleteConfirm}
                >
                    {getIntlText('common.label.delete')}
                </Button>
            </Stack>
        );
    }, [getIntlText, handleDeleteConfirm, selectedIds]);

    const handleTableBtnClick: UseColumnsProps<TableRowDataType>['onButtonClick'] = useCallback(
        (type, record) => {
            console.log(type, record);
            switch (type) {
                case 'detail': {
                    console.log('go to detail');
                    navigate(`/device/detail/${record.id}`);
                    break;
                }
                case 'delete': {
                    console.log('delete');
                    break;
                }
                default: {
                    break;
                }
            }
        },
        [navigate],
    );
    const columns = useColumns<TableRowDataType>({ onButtonClick: handleTableBtnClick });

    return (
        <div className="ms-main">
            <Breadcrumbs />
            <div className="ms-view ms-view-device">
                <div className="ms-view__inner">
                    <TablePro<TableRowDataType>
                        checkboxSelection
                        loading={loading}
                        columns={columns}
                        rows={deviceData?.content}
                        rowCount={deviceData?.total || 0}
                        paginationModel={paginationModel}
                        rowSelectionModel={selectedIds}
                        isRowSelectable={({ row }) => row.deletable}
                        toolbarRender={toolbarRender}
                        onPaginationModelChange={setPaginationModel}
                        onRowSelectionModelChange={setSelectedIds}
                        onRowDoubleClick={({ row }) => {
                            navigate(`/device/detail/${row.id}`);
                        }}
                        onSearch={setKeyword}
                        onRefreshButtonClick={getDeviceList}
                    />
                </div>
            </div>
            <AddModal visible={modalOpen} onCancel={() => setModalOpen(false)} />
        </div>
    );
};
