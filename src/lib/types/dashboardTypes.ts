export interface Tab {
    id: string
    title: string
    href?: string
    active?: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stateData?: { [key: string]: any },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockData?: any
    tab?: string
    subTab?: string
}

export type Note = {
    id: string;
    date: string;
    title: string;
    path: string;
};