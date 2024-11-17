import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Line as LineGraph } from "react-chartjs-2";
import { Context } from "@app/data/model/classes";
import { MonthlyResult } from "@app/data/parameters/monthly-parameters";
import { InputResult } from "@app/data/parameters/input-parameters";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const lineColors = [
  "#991111",
  "#111199",
  "#119911",
  "#999911",
  "#991199",
  "#119999",
];

interface GraphProps {
  monthlyData: MonthlyResult["plainResult"][][];
  inputData: InputResult[];
  yAxisKey: string;
  labels: string[];
}

export const Graph = ({
  monthlyData,
  inputData,
  yAxisKey,
  labels,
}: GraphProps) => {
  return (
    <div className="p-4 rounded-xl bg-gray-300 shadow-2xl">
      <LineGraph
        data={{
          datasets: [
            ...monthlyData.map((data, i) => ({
              data,
              parsing: {
                yAxisKey: yAxisKey,
                xAxisKey: "month",
              },
              label: inputData[i].hash,
              backgroundColor: lineColors[i % lineColors.length],
              borderColor: lineColors[i % lineColors.length],
            })),
          ],
          labels,
        }}
      />
    </div>
  );
};
