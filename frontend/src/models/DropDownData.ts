export interface DropdownItem {
    label: string;
    id: number;
}

export interface DropdownData {
    label?: string,
    defaultChosenId: number,
    items: DropdownItem[];
}