import { useState, useEffect, SyntheticEvent } from 'react';
import {
    Box,
    Tabs,
    Tab,
    IconButton,
    LinearProgress,
    Slide,
} from '@mui/material';
import { Cached } from '@mui/icons-material';
import {
    DataGrid,
    GridColDef,
    GridRowModel,
    GridSortModel,
    GridFilterModel,
} from '@mui/x-data-grid';

import { useQuery } from 'decago';
import getSchema from '../api/queries/getSchema';
import getRows from '../api/queries/getRows';

const sleep = (time: number) =>
    new Promise((resolve) => setTimeout(resolve, time));

export default function Home() {
    const [tabValue, setTabValue] = useState(0);
    const [value, setValue] = useState(0);
    const [height, setHeight] = useState(0);
    const [columns, setColumns] = useState<GridColDef[]>([]);
    const [rows, setRows] = useState<GridRowModel[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState<boolean | undefined>(undefined);
    const [select, setSelect] = useState<any>(undefined);
    const [sortModel, setSortModel] = useState<GridSortModel>([]);
    const [filterModel, setFilterModel] = useState<GridFilterModel>({
        items: [],
    });
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(25);
    const [tabIn, setTabIn] = useState(true);
    const [tabSlideDirection, setTabSlideDirection] = useState<
        'left' | 'right'
    >('left');

    const handleChange = async (event: SyntheticEvent, newValue: number) => {
        setTabSlideDirection(value < newValue ? 'right' : 'left');
        setTabIn(false);
        setTabValue(newValue);
        setRows([]);
        await sleep(200);
        setValue(newValue);
        setTabSlideDirection(value < newValue ? 'left' : 'right');
        setTabIn(true);
    };

    const [
        schema,
        {
            again: fetchSchema,
            isLoading: schemaIsLoading,
            isError: schemaIsError,
        },
    ] = useQuery(getSchema, {});

    const [
        data,
        {
            again: fetchData,
            isLoading: dataIsLoading,
            isError: dataIsError,
            setInput,
        },
    ] = useQuery(getRows, {
        model: schema?.[value]?.name,
    });

    useEffect(() => {
        const handleReload = () => {
            fetchSchema();
            fetchData();
        };

        const timeout = setTimeout(handleReload, 60000);

        if (typeof window !== 'undefined' && window.addEventListener) {
            window.addEventListener('visibilitychange', handleReload, false);
            window.addEventListener('focus', handleReload, false);
        }

        return () => {
            clearTimeout(timeout);

            window.removeEventListener('visibilitychange', handleReload);
            window.removeEventListener('focus', handleReload);
        };
    });

    useEffect(() => {
        setIsLoading(schemaIsLoading || dataIsLoading);
    }, [dataIsLoading, schemaIsLoading, setIsLoading]);

    useEffect(() => {
        setIsError(schemaIsError || dataIsError ? true : undefined);
    }, [dataIsError, schemaIsError, setIsError]);

    useEffect(() => {
        setHeight(window.innerHeight - 49);
    }, [setHeight]);

    useEffect(() => {
        if (typeof schema !== 'undefined') {
            const tableName = schema[value]?.name;
            document.title = tableName;
            setColumns(
                schema[value]?.columns.map((column) => ({
                    field: column.name,
                    headerName: column.name,
                    type: column.type,
                    valueGetter: ['date', 'dateTime'].includes(column.type)
                        ? ({ value }) => value && new Date(value)
                        : undefined,
                })) || []
            );
        }
    }, [schema, value]);

    useEffect(() => {
        setInput({
            model: schema?.[value]?.name,
            select,
        });
    }, [schema, value, select, setInput]);

    useEffect(() => {
        setSelect({
            // where: {},
            // orderBy: Object.fromEntries(
            //     sortModel.map((item) => [
            //         item.field,
            //         item.sort?.toUpperCase() || undefined,
            //     ])
            // ),
            skip: page * pageSize,
            take: pageSize,
        });
    }, [sortModel, filterModel, page, pageSize, setRows]);

    useEffect(() => {
        if (typeof data !== 'undefined') {
            setRows(data);
        }
    }, [data]);

    return (
        <>
            <Box
                sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    display: 'flex',
                }}
            >
                <IconButton
                    sx={{ padding: '0', margin: '.333333em' }}
                    onClick={() => {
                        fetchSchema();
                        fetchData();
                    }}
                >
                    <Cached sx={{ margin: '.166666em' }} />
                </IconButton>
                <Tabs
                    value={tabValue}
                    onChange={handleChange}
                    variant="scrollable"
                    scrollButtons
                    allowScrollButtonsMobile
                >
                    {schema?.map((item, index) => (
                        <Tab
                            label={item.name}
                            key={index}
                            id={`tab-${index}`}
                            aria-controls={`tabpanel-${index}`}
                        />
                    ))}
                </Tabs>
            </Box>
            <Box
                role="tabpanel"
                id={`tabpanel-${value}`}
                aria-labelledby={`tab-${value}`}
                sx={{
                    overflow: 'hidden',
                }}
            >
                <Slide
                    direction={tabSlideDirection}
                    in={tabIn}
                    mountOnEnter
                    unmountOnExit
                    timeout={150}
                >
                    <Box sx={{ p: 2 }} height={height}>
                        {schema && schema[value] ? (
                            <DataGrid
                                rows={rows}
                                getRowId={(row) => row.id}
                                columns={columns}
                                loading={isLoading}
                                error={isError}
                                components={{
                                    LoadingOverlay: LinearProgress,
                                }}
                                sortingMode="server"
                                onSortModelChange={setSortModel}
                                filterMode="server"
                                onFilterModelChange={setFilterModel}
                                paginationMode="server"
                                onPageChange={(newPage) => setPage(newPage)}
                                onPageSizeChange={(newPageSize) =>
                                    setPageSize(newPageSize)
                                }
                                pageSize={pageSize}
                                rowCount={pageSize}
                                checkboxSelection
                                disableSelectionOnClick
                            />
                        ) : null}
                    </Box>
                </Slide>
            </Box>
        </>
    );
}
