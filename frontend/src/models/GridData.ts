export interface GridColumn {
    id: number;
    label: string;
    searchable: boolean;
}

export interface GridColumnValue {
    column_id: number;
    value: string;
}

export interface GridRow {
    values: GridColumnValue[];
    key: number;
}

export interface GridData {
    columns: GridColumn[];
    rows: GridRow[];
}


