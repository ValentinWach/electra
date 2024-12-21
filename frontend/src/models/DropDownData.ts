export interface DropdownItem {
    label: string;
    id: number;
}

export interface DropdownType {
    label: string | undefined, //Leave empty to use item labels
    defaultChosen: number,
    items: DropdownItem[];
}