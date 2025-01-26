export interface GridColumn {
    id: number;
    label: string;
    searchable: boolean;
}

export interface GridColumnValue {
    column_id: number;
    value: string;
    style?: { [key: string]: string };
    badge?: {color: string};
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
    xlWidth: boolean;

    constructor(header: string, xlWidth?: boolean) {
        this.header = header;
        this.xlWidth = xlWidth ?? true;
    }
}


