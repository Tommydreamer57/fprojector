"use client";

import { Code } from "@app/components/code";
import { SidebarSection } from "@app/components/section";
import { getInputContext } from "@app/data/parameters/input-parameters";
import { getMonthlyContext } from "@app/data/parameters/monthly-parameters";
import { Parameters } from "@app/parameters/parameters";
import { Visualizations } from "@app/visualizations/visualizations";
import { useMemo } from "react";

export default function Home() {
  const monthlyContext = useMemo(() => getMonthlyContext(), []);
  const inputContext = useMemo(() => getInputContext(), []);
  const inputData = useMemo(() => inputContext.evaluate(), []);

  return (
    <main className="grid grid-cols-8 grid-rows-none w-full">
      <div className="col-span-2 relative">
        <div className="w-full h-screen sticky top-0 bottom-0">
          <aside className="inset-8 right-0 bg-gray-300 border border-gray-400 text-gray-900 shadow-2xl absolute overflow-hidden">
            <div className="p-4">
              <SidebarSection title="Base Parameters">
                {inputContext.parameterList.map(({ key, expressions }) => (
                  <div className="pb-2" key={key}>
                    <Code>{key}</Code>
                    {" = "}
                    <Code>{expressions[0].expression}</Code>
                    {/* <ul>
                      {expressions.map(({ expression }) => (
                        <li className="mt-2">
                          {" = "}
                          <Code>{expression}</Code>
                        </li>
                      ))}
                    </ul> */}
                  </div>
                ))}
              </SidebarSection>
            </div>
          </aside>
        </div>
      </div>
      <div className="col-span-6 p-8">
        <Parameters
          monthlyContext={monthlyContext}
          inputContext={inputContext}
          inputData={inputData}
        />
        <Visualizations monthlyContext={monthlyContext} inputData={inputData} />
      </div>
    </main>
  );
}
