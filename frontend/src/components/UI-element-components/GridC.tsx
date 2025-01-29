import ContentTileC from "./ContentTileC.tsx";
import './GridC.css';
import { GridData, ContentTileConfig } from "../../models/GridData.ts";
import InputC from "./InputC.tsx";
import { useEffect, useState } from "react";
import PaginationC from "./PaginationC.tsx";
import BadgeC from "./BadgeC.tsx";

export default function GridC({ gridData, usePagination = true, pageSize = 10, contentTileConfig, defaultSortColumnId, defaultSortDirection = 'asc', onRowClick, loading = false }: {
    gridData: GridData,
    usePagination?: boolean,
    pageSize?: number,
    contentTileConfig?: ContentTileConfig,
    defaultSortColumnId?: number,
    defaultSortDirection?: 'asc' | 'desc',
    onRowClick?: (id: number) => void,
    loading?: boolean,
}) {

    const [filteredGridData, setFilteredGridData] = useState<GridData>({
        rows: [],
        columns: [],
    });
    const [currentPageGridData, setCurrentPageGridData] = useState<GridData>({
        rows: [],
        columns: [],
    });
    const [currentFilters, setCurrentFilters] = useState<Map<number, string>>(new Map());

    const [sortConfig, setSortConfig] = useState<{
        columnId: number,
        direction: 'asc' | 'desc'
    }>({ columnId: defaultSortColumnId ?? 0, direction: defaultSortDirection ?? 'asc' });
    const [currentPage, setCurrentPage] = useState<number>(1);

    useEffect(() => {
        const filterAndSortData = () => {
            let data = [...(gridData.rows ?? [])];

            // Apply filters
            data = data.filter(row => {
                return Array.from(currentFilters.entries()).every(([key, value]) =>
                    row.values.some(col => col.column_id === key && col.value.toLowerCase().includes(value.toLowerCase()))
                );
            });

            if (sortConfig.columnId !== null && sortConfig.direction !== null) {
                data.sort((a, b) => {
                    const aValue = a.values.find(col => col.column_id === sortConfig.columnId)?.value.replace(/\s+/g, '') || "";
                    const bValue = b.values.find(col => col.column_id === sortConfig.columnId)?.value.replace(/\s+/g, '') || "";

                    if (sortConfig.direction === 'asc') {
                        return aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: 'base' });
                    } else {
                        return bValue.localeCompare(aValue, undefined, { numeric: true, sensitivity: 'base' });
                    }
                });
            }

            setFilteredGridData({ ...gridData, rows: data });
            setCurrentPage(1);
        };

        filterAndSortData();
    }, [currentFilters, sortConfig, gridData]);

    function setFilters(col_id: number, filter_val: string) {
        let filters = new Map(currentFilters);
        if (filter_val.trim() === "") {
            filters.delete(col_id);
        } else {
            filters.set(col_id, filter_val.trim());
        }
        setCurrentFilters(filters);
    }

    function handleSort(columnKey: number) {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.columnId === columnKey && sortConfig.direction === 'asc') {
            direction = 'desc';
        } else if (sortConfig.columnId === columnKey && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ columnId: columnKey, direction });
    }

    useEffect(() => {
        const pageinateData = () => {
            if (usePagination) {
                const maxPage = Math.max(Math.ceil(filteredGridData.rows.length / pageSize), 1);
                if (maxPage < currentPage)
                    setCurrentPage(maxPage);
                else if (currentPage < 1)
                    setCurrentPage(1);

                let newRows = filteredGridData.rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
                setCurrentPageGridData({ ...filteredGridData, rows: newRows });
            } else {
                setCurrentPageGridData(filteredGridData);
            }
        };
        pageinateData();
    }, [currentPage, filteredGridData]);

    const tableContent = (
        <>
            <table className={`table ${usePagination ? "" : "xl:table-auto xl:text-wrap"} table-fixed text-nowrap`}>
                <thead>
                    <tr>
                        {gridData.columns.map(column => (
                            <th key={column.id} scope="col">
                                <div onClick={() => handleSort(column.id)}>
                                    {column.label} {sortConfig.columnId === column.id ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                                </div>
                                {gridData.columns.some(col => col.searchable) && (
                                    <InputC placeholder={column.label + " filtern"}
                                        onInputFunction={(filter_val) => setFilters(column.id, filter_val)}
                                        hidden={!column.searchable} id={column.id.toString()} name={column.label} />
                                )}
                            </th>
                        ))}
                        {onRowClick && <th className="w-32"></th>}
                    </tr>
                </thead>
                <tbody>
                    {currentPageGridData.rows.map((row, index) => (
                        <tr key={row.key} className={`${onRowClick ? "hover:cursor-pointer hover:underline" : ""}`} onClick={() => onRowClick && onRowClick(row.key)}>
                            {row.values.map((col, index) => (
                                <td title={col.value} key={index} style={col.style}>{col.badge ? <BadgeC text={col.value} color={col.badge.color} /> : col.value}</td>
                            ))}
                            {onRowClick && <td className="w-32">
                                <button
                                    type="button"
                                    className="rounded-full bg-white px-2.5 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-100"
                                >
                                    Details
                                </button>
                            </td>}
                        </tr>
                    ))}
                </tbody>
            </table>
            {usePagination &&
                <PaginationC numOfPages={Math.ceil(filteredGridData.rows.length / pageSize)}
                    selectedPageProp={currentPage} switchPage={(p: number) => {
                        setCurrentPage(p)
                    }} />
            }
        </>
    )

    return contentTileConfig ? (
        <ContentTileC header={contentTileConfig.header} xlWidth={contentTileConfig.xlWidth} loading={loading}>
            {tableContent}
        </ContentTileC>
    ) : tableContent;
}
