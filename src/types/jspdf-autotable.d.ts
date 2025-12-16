declare module 'jspdf-autotable' {
    import { jsPDF } from 'jspdf';

    interface AutoTableOptions {
        head?: any[][];
        body?: any[][];
        startY?: number;
        theme?: 'striped' | 'grid' | 'plain';
        headStyles?: any;
        [key: string]: any;
    }

    export function autoTable(doc: jsPDF, options: AutoTableOptions): void;
    export default function autoTable(doc: jsPDF, options: AutoTableOptions): void;
}
