"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconTrash, IconEdit, IconEye } from "@tabler/icons-react";
import { formatDateTime } from "@/lib/date-utils";

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface TableAction<T> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  onClick: (row: T) => void;
  show?: (row: T) => boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  loading = false,
  emptyMessage = "No data found",
  onRowClick,
  className,
}: DataTableProps<T>) {
  const renderCellValue = (column: TableColumn<T>, row: T) => {
    let value = null;

    if (column.key !== "actions") {
      // Handle nested property access with dot notation (e.g., "attributes.firstname")
      const keys = (column.key as string).split(".");
      value = row as any;

      for (const key of keys) {
        value = value?.[key];
        if (value === undefined) break;
      }
    }

    if (column.render) {
      return column.render(value, row);
    }

    // Default renderers for common data types
    if (value && typeof value === "object" && value.constructor === Date) {
      return formatDateTime((value as Date).toISOString());
    }

    if (typeof value === "boolean") {
      return (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Yes" : "No"}
        </Badge>
      );
    }

    if (typeof value === "string" && value.startsWith("http")) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          Link
        </a>
      );
    }

    return value?.toString() || "";
  };

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key as string}
                  className={column.className}
                >
                  {column.header}
                </TableHead>
              ))}
              {actions.length > 0 && (
                <TableHead className="w-[100px]">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column.key as string}>
                    <div className="h-4 bg-muted animate-pulse rounded" />
                  </TableCell>
                ))}
                {actions.length > 0 && (
                  <TableCell>
                    <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key as string}
                  className={column.className}
                >
                  {column.header}
                </TableHead>
              ))}
              {actions.length > 0 && (
                <TableHead className="w-[100px]">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell
                colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className={`rounded-md border ${className || ""}`}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key as string}
                className={column.className}
              >
                {column.header}
              </TableHead>
            ))}
            {actions.length > 0 && (
              <TableHead className="w-[100px]">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={index}
              className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.key as string}
                  className={column.className}
                >
                  {renderCellValue(column, row)}
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell>
                  <div className="flex items-center gap-1">
                    {actions
                      .filter((action) => !action.show || action.show(row))
                      .map((action, actionIndex) => {
                        const IconComponent = action.icon;
                        return (
                          <Button
                            key={actionIndex}
                            variant={action.variant || "ghost"}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(row);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            {IconComponent && (
                              <IconComponent className="h-4 w-4" />
                            )}
                          </Button>
                        );
                      })}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
