export interface GridColumn {
    id: number;
    label: string;
    searchable: boolean;
}

export interface GridColumnValue {
    column_id: number;
    value: string;
    style?: { [key: string]: string };
}

export interface GridRow {
    values: GridColumnValue[];
    key: number;
}

export class GridData {
    columns: GridColumn[];
    rows: GridRow[];

    constructor(columns: GridColumn[], rows: GridRow[]) {
        this.columns = columns;
        this.rows = rows;
    }
}

export class ContentTileConfig {
    header: string;
    doubleSize: boolean;

    constructor(header: string, doubleSize?: boolean) {
        this.header = header;
        this.doubleSize = doubleSize ?? true;
    }
}


