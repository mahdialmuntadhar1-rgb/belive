export function createColumnHelper() {
  return {
    accessor: (key: string, def: any) => ({ id: key, accessorKey: key, columnDef: def }),
    display: (def: any) => ({ id: def.id, columnDef: def }),
  };
}

export function getCoreRowModel() { return () => ({}); }
export function getFilteredRowModel() { return () => ({}); }
export function getPaginationRowModel() { return () => ({}); }

function getValueByPath(obj: any, path: string) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

export function useReactTable({ data, columns }: any) {
  const rows = data.map((original: any, index: number) => ({
    id: String(index),
    original,
    getVisibleCells: () => columns.map((column: any, cellIndex: number) => ({
      id: `${index}_${cellIndex}`,
      column,
      getContext: () => ({
        row: { original },
        getValue: () => getValueByPath(original, column.accessorKey),
      }),
    })),
  }));

  return {
    getHeaderGroups: () => [{ id: 'header', headers: columns.map((column: any, idx: number) => ({ id: String(idx), column, getContext: () => ({}) })) }],
    getRowModel: () => ({ rows }),
    previousPage: () => {},
    nextPage: () => {},
    getCanPreviousPage: () => false,
    getCanNextPage: () => false,
  };
}

export function flexRender(renderer: any, context: any) {
  if (typeof renderer === 'function') return renderer(context);
  return renderer;
}
