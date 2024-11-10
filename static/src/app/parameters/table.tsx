interface ColumnDefinition {
  title: string;
  key: keyof Expression;
  isExpression?: boolean;
}

const columnDefinitions: ColumnDefinition[] = [
  {
    title: "Variable",
    key: "name",
  },
  {
    title: "Key",
    key: "key",
    isExpression: true,
  },
  {
    title: "Expressions",
    key: "expressions",
    isExpression: true,
  },
];

type TableCellProps = React.PropsWithChildren<{
  as?: "th" | "td";
}>;

const TableCell = ({ children, as = "td" }: TableCellProps) => {
  const tag = { name: as };
  return (
    <tag.name className="border border-gray-500 text-left py-1 px-2">
      {children}
    </tag.name>
  );
};

interface SingleExpressionProps {
  expression: string;
}

const SingleExpression = ({ expression }: SingleExpressionProps) => (
  <pre className="inline-block rounded px-1 bg-gray-200 text-gray-600 font-mono whitespace-normal">
    {expression}
  </pre>
);

interface Expression {
  key: string;
  name: string;
  expressions: string[];
}

interface ExpressionTableProps {
  expressions: Expression[];
}
export const ExpressionTable = ({ expressions }: ExpressionTableProps) => {
  return (
    <table className="border bg-gray-300">
      <thead className="bg-gray-400 text-gray-900">
        <tr>
          {columnDefinitions.map(({ title, key }) => (
            <TableCell key={key} as="th">
              {title}
            </TableCell>
          ))}
        </tr>
      </thead>
      <tbody className="text-gray-800">
        {expressions.map(expression => (
          <tr>
            {columnDefinitions.map(({ key, isExpression = false }) => {
              let value = expression[key];

              const renderValue = (value: string) =>
                isExpression ? (
                  <span>
                    {key === "expressions" ? "= " : ""}
                    <SingleExpression expression={value} />
                  </span>
                ) : (
                  value
                );

              return (
                <TableCell key={key}>
                  {Array.isArray(value) ? (
                    <ul className="">
                      {value.map((val, i) => (
                        <li className={` ${i > 0 ? "mt-1" : ""}`}>
                          {renderValue(val)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    renderValue(value)
                  )}
                </TableCell>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
